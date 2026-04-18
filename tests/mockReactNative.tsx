import Module from 'node:module';

import React, { useImperativeHandle } from 'react';

import type { FocusableInput } from '../src';

type MockTextInputProps = Record<string, unknown>;
type LoadFunction = (request: string, parent?: unknown, isMain?: boolean) => unknown;

const MockTextInput = React.forwardRef<FocusableInput, MockTextInputProps>(function MockTextInput(
  props,
  ref
) {
  useImperativeHandle(
    ref,
    () => ({
      blur() {},
      focus() {},
    }),
    []
  );

  return React.createElement('MockTextInput', props);
});

export const mockReactNativeModule = {
  TextInput: MockTextInput,
};

export const withMockedReactNative = <T,>(loadModule: () => T): T => {
  const nodeModule = Module as typeof Module & { _load: LoadFunction };
  const originalLoad = nodeModule._load;

  nodeModule._load = ((request: string, parent?: unknown, isMain?: boolean) => {
    if (request === 'react-native') {
      return mockReactNativeModule;
    }

    return originalLoad.call(nodeModule, request, parent, isMain);
  }) as LoadFunction;

  try {
    return loadModule();
  } finally {
    nodeModule._load = originalLoad;
  }
};
