import assert from 'node:assert/strict';
import test from 'node:test';

import type {
  ConnectedInputOptions,
  ConnectedInputProps,
  ConnectedInputsContextType,
  FocusableInput,
} from '../src';

type SourceModule = typeof import('../src');
type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2)
    ? true
    : false;
type Assert<T extends true> = T;

type _UseConnectedInputsSignature = Assert<
  Equal<
    ReturnType<SourceModule['useConnectedInputs']>,
    (order: number, options?: ConnectedInputOptions) => ConnectedInputProps
  >
>;

type _ContextConnectInputSignature = Assert<
  Equal<
    ConnectedInputsContextType['connectInput'],
    (order: number, options?: ConnectedInputOptions) => ConnectedInputProps
  >
>;

type _FocusableInputRefSignature = Assert<
  Equal<ConnectedInputProps['ref'], (input: FocusableInput | null) => void>
>;

test('public type surface compiles', () => {
  assert.ok(true);
});
