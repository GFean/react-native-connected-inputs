import assert from 'node:assert/strict';
import test from 'node:test';

import { createConnectedInputController } from '../src/connectedInputController';

import type { FocusableInput } from '../src';

const createFocusableInput = (name: string, events: string[]): FocusableInput => ({
  blur() {
    events.push(`blur:${name}`);
  },
  focus() {
    events.push(`focus:${name}`);
  },
});

test('controller navigates to the next sparse input and submits the last one', () => {
  const events: string[] = [];
  const controller = createConnectedInputController();
  const firstInput = createFocusableInput('first', events);
  const lastInput = createFocusableInput('last', events);

  controller.setSubmitHandler(() => {
    events.push('submit');
  });

  controller.registerInput(1, firstInput);
  controller.registerInput(10, lastInput);

  const firstProps = controller.connectInput(1);
  const lastProps = controller.connectInput(10);

  assert.equal(firstProps.returnKeyType, 'next');
  assert.equal(lastProps.returnKeyType, 'done');
  assert.equal(lastProps.blurOnSubmit, true);

  firstProps.onSubmitEditing();
  lastProps.onSubmitEditing();

  assert.deepEqual(events, ['focus:last', 'blur:last', 'submit']);
});

test('controller composes external refs and existing submit handlers', () => {
  const events: string[] = [];
  const handlerCalls: string[] = [];
  const externalRef: { current: FocusableInput | null } = { current: null };
  const controller = createConnectedInputController();
  const onlyInput = createFocusableInput('only', events);

  controller.setSubmitHandler(() => {
    handlerCalls.push('submit');
  });

  const initialProps = controller.connectInput(0, {
    ref: externalRef,
    onSubmitEditing: () => {
      handlerCalls.push('external');
    },
  });

  initialProps.ref(onlyInput);

  const connectedProps = controller.connectInput(0, {
    ref: externalRef,
    onSubmitEditing: () => {
      handlerCalls.push('external');
    },
  });

  assert.equal(externalRef.current, onlyInput);
  assert.equal(connectedProps.returnKeyType, 'done');

  connectedProps.onSubmitEditing();

  assert.deepEqual(handlerCalls, ['external', 'submit']);
  assert.deepEqual(events, ['blur:only']);
});

test('controller recalculates the last input after unregistration', () => {
  const controller = createConnectedInputController();

  controller.registerInput(0, createFocusableInput('first', []));
  controller.registerInput(4, createFocusableInput('second', []));
  controller.registerInput(4, null);

  const remainingInputProps = controller.connectInput(0);

  assert.equal(remainingInputProps.returnKeyType, 'done');
  assert.equal(remainingInputProps.blurOnSubmit, true);
});

test('controller only notifies about real registration changes', () => {
  let changeCount = 0;
  const controller = createConnectedInputController(() => {
    changeCount += 1;
  });
  const input = createFocusableInput('tracked', []);

  controller.registerInput(3, input);
  controller.registerInput(3, input);
  controller.registerInput(3, null);
  controller.registerInput(3, null);

  assert.equal(changeCount, 2);
});

test('controller ignores registration changes that do not change the last order', () => {
  let changeCount = 0;
  const controller = createConnectedInputController(() => {
    changeCount += 1;
  });
  const firstInput = createFocusableInput('first', []);
  const middleInput = createFocusableInput('middle', []);
  const lastInput = createFocusableInput('last', []);
  const replacementMiddleInput = createFocusableInput('middle:replacement', []);

  controller.registerInput(1, firstInput);
  controller.registerInput(10, lastInput);
  controller.registerInput(5, middleInput);
  controller.registerInput(5, replacementMiddleInput);
  controller.registerInput(5, null);

  assert.equal(changeCount, 2);
});

test('controller keeps stable callbacks while following the latest external handler', () => {
  const handlerCalls: string[] = [];
  const controller = createConnectedInputController();
  const input = createFocusableInput('tracked', []);

  const firstProps = controller.connectInput(5, {
    onSubmitEditing: () => {
      handlerCalls.push('first');
    },
  });

  firstProps.ref(input);

  const secondProps = controller.connectInput(5, {
    onSubmitEditing: () => {
      handlerCalls.push('second');
    },
  });

  assert.equal(firstProps.ref, secondProps.ref);
  assert.equal(firstProps.onSubmitEditing, secondProps.onSubmitEditing);

  firstProps.onSubmitEditing();

  assert.deepEqual(handlerCalls, ['second']);
});

test('controller clears the previous external ref when the consumer swaps refs', () => {
  const controller = createConnectedInputController();
  const firstExternalRef: { current: FocusableInput | null } = { current: null };
  const secondExternalRef: { current: FocusableInput | null } = { current: null };
  const input = createFocusableInput('tracked', []);

  const firstProps = controller.connectInput(2, {
    ref: firstExternalRef,
  });

  firstProps.ref(input);

  const secondProps = controller.connectInput(2, {
    ref: secondExternalRef,
  });

  secondProps.ref(input);

  assert.equal(firstExternalRef.current, null);
  assert.equal(secondExternalRef.current, input);
});

test('controller submits cleanly when the last input has no blur method', () => {
  const handlerCalls: string[] = [];
  const controller = createConnectedInputController();
  const input: FocusableInput = {
    focus() {
      handlerCalls.push('focus');
    },
  };

  controller.registerInput(0, input);
  controller.setSubmitHandler(() => {
    handlerCalls.push('submit');
  });

  const connectedProps = controller.connectInput(0);

  assert.doesNotThrow(() => {
    connectedProps.onSubmitEditing();
  });
  assert.deepEqual(handlerCalls, ['submit']);
});

test('controller can resolve the next registered input before the current input mounts', () => {
  const events: string[] = [];
  const controller = createConnectedInputController();

  controller.registerInput(1, createFocusableInput('first', events));
  controller.registerInput(4, createFocusableInput('last', events));

  const middleProps = controller.connectInput(2);

  assert.equal(middleProps.returnKeyType, 'next');

  middleProps.onSubmitEditing();

  assert.deepEqual(events, ['focus:last']);
});
