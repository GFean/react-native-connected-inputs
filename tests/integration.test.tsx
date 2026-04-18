import assert from 'node:assert/strict';
import test from 'node:test';

import React, { useEffect, useImperativeHandle } from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { mockReactNativeModule, withMockedReactNative } from './mockReactNative';

import type { FocusableInput } from '../src';

type ConnectedInputsModule = typeof import('../src/index');

const {
  ConnectedInputs,
  ConnectedInputsProvider,
  useConnectedInputs,
  useConnectedInputsContext,
} = withMockedReactNative(() => require('../src/index')) as ConnectedInputsModule;

const hasHostType =
  (expectedType: string) =>
  (node: TestRenderer.ReactTestInstance): boolean =>
    (node.type as unknown) === expectedType;

const createFakeInput = (events: string[]) =>
  React.forwardRef<
    FocusableInput,
    {
      blurOnSubmit?: boolean;
      name: string;
      onSubmitEditing?: () => void;
      returnKeyType?: string;
    }
  >(function FakeInput({ name, ...props }, ref) {
    useImperativeHandle(
      ref,
      () => ({
        blur() {
          events.push(`blur:${name}`);
        },
        focus() {
          events.push(`focus:${name}`);
        },
      }),
      [events, name]
    );

    return React.createElement('FakeInputHost', { name, ...props });
  });

test('package index exports the expected public API', () => {
  const packageExports = withMockedReactNative(() => require('../src/index')) as ConnectedInputsModule;

  assert.equal(typeof packageExports.ConnectedInputs, 'function');
  assert.equal(typeof packageExports.ConnectedInputsProvider, 'function');
  assert.equal(typeof packageExports.useConnectedInputs, 'function');
  assert.equal(typeof packageExports.useConnectedInputsContext, 'function');
});

test('useConnectedInputs updates the last input and composes submit handlers and refs', () => {
  const events: string[] = [];
  const submissions: string[] = [];
  const externalHandlers: string[] = [];
  const externalRef: { current: FocusableInput | null } = { current: null };
  const FakeInput = createFakeInput(events);

  const HookForm = () => {
    const connectInput = useConnectedInputs(() => {
      submissions.push('submit');
    });

    return React.createElement(
      React.Fragment,
      null,
      React.createElement(FakeInput, { name: 'first', ...connectInput(2) }),
      React.createElement(FakeInput, {
        name: 'last',
        ...connectInput(7, {
          ref: externalRef,
          onSubmitEditing: () => {
            externalHandlers.push('external:last');
          },
        }),
      })
    );
  };

  let renderer: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(React.createElement(HookForm));
  });

  const inputs = renderer!.root.findAll(hasHostType('FakeInputHost'));

  assert.equal(inputs.length, 2);
  assert.equal(inputs[0].props.returnKeyType, 'next');
  assert.equal(inputs[1].props.returnKeyType, 'done');
  assert.equal(inputs[1].props.blurOnSubmit, true);
  assert.ok(externalRef.current);

  act(() => {
    inputs[0].props.onSubmitEditing();
  });

  act(() => {
    inputs[1].props.onSubmitEditing();
  });

  assert.deepEqual(events, ['focus:last', 'blur:last']);
  assert.deepEqual(externalHandlers, ['external:last']);
  assert.deepEqual(submissions, ['submit']);
});

test('useConnectedInputs uses the latest submit callback after rerender', () => {
  const submissions: string[] = [];
  const FakeInput = createFakeInput([]);

  const HookForm = ({ onSubmit }: { onSubmit?: () => void }) => {
    const connectInput = useConnectedInputs(onSubmit);

    return React.createElement(FakeInput, { name: 'only', ...connectInput(0) });
  };

  let renderer: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(
      React.createElement(HookForm, {
        onSubmit: () => {
          submissions.push('first');
        },
      })
    );
  });

  act(() => {
    renderer!.update(
      React.createElement(HookForm, {
        onSubmit: () => {
          submissions.push('second');
        },
      })
    );
  });

  const input = renderer!.root.find(hasHostType('FakeInputHost'));

  act(() => {
    input.props.onSubmitEditing();
  });

  assert.deepEqual(submissions, ['second']);
});

test('useConnectedInputs clears the submit callback after rerendering without one', () => {
  const submissions: string[] = [];
  const FakeInput = createFakeInput([]);

  const HookForm = ({ onSubmit }: { onSubmit?: () => void }) => {
    const connectInput = useConnectedInputs(onSubmit);

    return React.createElement(FakeInput, { name: 'only', ...connectInput(0) });
  };

  let renderer: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(
      React.createElement(HookForm, {
        onSubmit: () => {
          submissions.push('submit');
        },
      })
    );
  });

  act(() => {
    renderer!.update(React.createElement(HookForm, { onSubmit: undefined }));
  });

  const input = renderer!.root.find(hasHostType('FakeInputHost'));

  act(() => {
    input.props.onSubmitEditing();
  });

  assert.deepEqual(submissions, []);
});

test('ConnectedInputsProvider connects inputs across component boundaries', () => {
  const events: string[] = [];
  const submissions: string[] = [];
  const FakeInput = createFakeInput(events);

  const PersonalDetails = () => {
    const { connectInput } = useConnectedInputsContext();

    return React.createElement(FakeInput, { name: 'first', ...connectInput(1) });
  };

  const AccountDetails = () => {
    const { connectInput } = useConnectedInputsContext();

    return React.createElement(FakeInput, { name: 'last', ...connectInput(9) });
  };

  const Form = () => {
    const { handleSubmit } = useConnectedInputsContext();

    useEffect(() => {
      handleSubmit(() => {
        submissions.push('submit');
      });
    }, [handleSubmit]);

    return React.createElement(
      React.Fragment,
      null,
      React.createElement(PersonalDetails),
      React.createElement(AccountDetails)
    );
  };

  let renderer: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(
      React.createElement(
        ConnectedInputsProvider,
        null,
        React.createElement(Form)
      )
    );
  });

  const inputs = renderer!.root.findAll(hasHostType('FakeInputHost'));

  assert.equal(inputs[1].props.returnKeyType, 'done');

  act(() => {
    inputs[0].props.onSubmitEditing();
  });

  act(() => {
    inputs[1].props.onSubmitEditing();
  });

  assert.deepEqual(events, ['focus:last', 'blur:last']);
  assert.deepEqual(submissions, ['submit']);
});

test('ConnectedInputsProvider can clear the submit handler', () => {
  const submissions: string[] = [];
  const FakeInput = createFakeInput([]);

  const Form = ({ clear }: { clear: boolean }) => {
    const { connectInput, handleSubmit } = useConnectedInputsContext();

    useEffect(() => {
      if (clear) {
        handleSubmit(undefined);
        return;
      }

      handleSubmit(() => {
        submissions.push('submit');
      });
    }, [clear, handleSubmit]);

    return React.createElement(FakeInput, { name: 'only', ...connectInput(0) });
  };

  let renderer: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(
      React.createElement(
        ConnectedInputsProvider,
        null,
        React.createElement(Form, { clear: false })
      )
    );
  });

  act(() => {
    renderer!.update(
      React.createElement(
        ConnectedInputsProvider,
        null,
        React.createElement(Form, { clear: true })
      )
    );
  });

  const input = renderer!.root.find(hasHostType('FakeInputHost'));

  act(() => {
    input.props.onSubmitEditing();
  });

  assert.deepEqual(submissions, []);
});

test('ConnectedInputsProvider supports manual registerInput lifecycles', () => {
  const events: string[] = [];
  const submissions: string[] = [];
  const manualInput: FocusableInput = {
    blur() {
      events.push('blur:manual');
    },
    focus() {
      events.push('focus:manual');
    },
  };

  const ManualField = () => {
    const { connectInput, handleSubmit, registerInput } = useConnectedInputsContext();

    useEffect(() => {
      handleSubmit(() => {
        submissions.push('submit');
      });

      registerInput(2, manualInput);

      return () => {
        registerInput(2, null);
      };
    }, [handleSubmit, registerInput]);

    return React.createElement('ManualFieldHost', connectInput(2));
  };

  let renderer: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(
      React.createElement(
        ConnectedInputsProvider,
        null,
        React.createElement(ManualField)
      )
    );
  });

  const field = renderer!.root.find(hasHostType('ManualFieldHost'));

  assert.equal(field.props.returnKeyType, 'done');

  act(() => {
    field.props.onSubmitEditing();
  });

  assert.deepEqual(events, ['blur:manual']);
  assert.deepEqual(submissions, ['submit']);
});

test('ConnectedInputsProvider does not rerender fields when a middle input registers later', () => {
  const renderCounts = {
    first: 0,
    last: 0,
  };
  const FakeInput = createFakeInput([]);
  const manualMiddleInput: FocusableInput = {
    focus() {},
  };

  const Field = ({ name, order }: { name: 'first' | 'last'; order: number }) => {
    renderCounts[name] += 1;

    const { connectInput } = useConnectedInputsContext();

    return React.createElement(FakeInput, { name, ...connectInput(order) });
  };

  const MiddleRegistrar = () => {
    const { registerInput } = useConnectedInputsContext();

    useEffect(() => {
      registerInput(5, manualMiddleInput);

      return () => {
        registerInput(5, null);
      };
    }, [registerInput]);

    return null;
  };

  act(() => {
    TestRenderer.create(
      React.createElement(
        ConnectedInputsProvider,
        null,
        React.createElement(Field, { name: 'first', order: 1 }),
        React.createElement(Field, { name: 'last', order: 10 }),
        React.createElement(MiddleRegistrar)
      )
    );
  });

  assert.deepEqual(renderCounts, {
    first: 2,
    last: 2,
  });
});

test('useConnectedInputsContext throws outside the provider', () => {
  const BrokenConsumer = () => {
    useConnectedInputsContext();
    return null;
  };

  const originalConsoleError = console.error;

  console.error = () => {};

  try {
    assert.throws(() => {
      act(() => {
        TestRenderer.create(React.createElement(BrokenConsumer));
      });
    }, /ConnectedInputsProvider/);
  } finally {
    console.error = originalConsoleError;
  }
});

test('ConnectedInputs traverses nested custom inputs and preserves child handlers', () => {
  const events: string[] = [];
  const childHandlers: string[] = [];
  const submissions: string[] = [];
  const FakeInput = createFakeInput(events);

  const Wrapper = ({ children }: { children?: React.ReactNode }) =>
    React.createElement('WrapperHost', null, children);

  let renderer: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(
      React.createElement(
        ConnectedInputs,
        {
          isInput: (child) => child.type === FakeInput,
          onSubmit: () => {
            submissions.push('submit');
          },
        },
        React.createElement(
          Wrapper,
          null,
          React.createElement(FakeInput, {
            name: 'first',
            onSubmitEditing: () => {
              childHandlers.push('child:first');
            },
          }),
          React.createElement(
            React.Fragment,
            null,
            React.createElement('LabelHost', { value: 'ignore' }),
            React.createElement(FakeInput, { name: 'last' })
          )
        )
      )
    );
  });

  const inputs = renderer!.root.findAll(hasHostType('FakeInputHost'));

  assert.equal(inputs.length, 2);
  assert.equal(inputs[1].props.returnKeyType, 'done');

  act(() => {
    inputs[0].props.onSubmitEditing();
  });

  act(() => {
    inputs[1].props.onSubmitEditing();
  });

  assert.deepEqual(childHandlers, ['child:first']);
  assert.deepEqual(events, ['focus:last', 'blur:last']);
  assert.deepEqual(submissions, ['submit']);
});

test('ConnectedInputs preserves and updates an existing child ref', () => {
  const childRefA: { current: FocusableInput | null } = { current: null };
  const childRefB: { current: FocusableInput | null } = { current: null };
  const FakeInput = createFakeInput([]);

  const Harness = ({ externalRef }: { externalRef: { current: FocusableInput | null } }) =>
    React.createElement(
      ConnectedInputs,
      {
        isInput: (child) => child.type === FakeInput,
      },
      React.createElement(FakeInput, {
        name: 'only',
        ref: externalRef,
      })
    );

  let renderer: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(React.createElement(Harness, { externalRef: childRefA }));
  });

  assert.ok(childRefA.current);

  act(() => {
    renderer!.update(React.createElement(Harness, { externalRef: childRefB }));
  });

  assert.equal(childRefA.current, null);
  assert.ok(childRefB.current);
});

test('ConnectedInputs leaves non-input children untouched', () => {
  let renderer: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(
      React.createElement(
        ConnectedInputs,
        null,
        React.createElement('PlainView', { testID: 'plain' })
      )
    );
  });

  const view = renderer!.root.find(hasHostType('PlainView'));

  assert.equal(view.props.onSubmitEditing, undefined);
  assert.equal(view.props.returnKeyType, undefined);
  assert.equal(view.props.blurOnSubmit, undefined);
});

test('ConnectedInputs handles a single direct TextInput child with the default matcher', () => {
  const onSubmitCalls: string[] = [];

  let renderer: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(
      React.createElement(
        ConnectedInputs,
        {
          onSubmit: () => {
            onSubmitCalls.push('submit');
          },
        },
        React.createElement(mockReactNativeModule.TextInput, { testID: 'only' })
      )
    );
  });

  const input = renderer!.root.find(hasHostType('MockTextInput'));

  assert.equal(input.props.returnKeyType, 'done');
  assert.equal(input.props.blurOnSubmit, true);

  act(() => {
    input.props.onSubmitEditing();
  });

  assert.deepEqual(onSubmitCalls, ['submit']);
});

test('ConnectedInputs handles empty children without throwing', () => {
  let renderer: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(React.createElement(ConnectedInputs, null));
  });

  assert.deepEqual(renderer!.root.children, []);
});
