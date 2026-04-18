import assert from 'node:assert/strict';
import test from 'node:test';

import {
  assignRef,
  callAll,
  composeRefs,
  getNextConnectedInputOrder,
  getRegisteredOrders,
  isLastConnectedInputOrder,
} from '../src/connectedInputUtils';

import type { FocusableInput } from '../src';

const createFocusableInput = (): FocusableInput => ({
  blur() {},
  focus() {},
});

test('getRegisteredOrders sorts registered inputs and ignores null refs', () => {
  const inputRefs = new Map<number, FocusableInput | null>([
    [10, createFocusableInput()],
    [1, createFocusableInput()],
    [5, null],
  ]);

  assert.deepEqual(getRegisteredOrders(inputRefs), [1, 10]);
});

test('getNextConnectedInputOrder supports sparse and one-based ordering', () => {
  const inputRefs = new Map<number, FocusableInput | null>([
    [1, createFocusableInput()],
    [4, createFocusableInput()],
    [10, createFocusableInput()],
  ]);

  assert.equal(getNextConnectedInputOrder(inputRefs, 1), 4);
  assert.equal(getNextConnectedInputOrder(inputRefs, 4), 10);
  assert.equal(getNextConnectedInputOrder(inputRefs, 10), null);
});

test('isLastConnectedInputOrder follows the highest mounted order after unregistration', () => {
  const inputRefs = new Map<number, FocusableInput | null>([
    [0, createFocusableInput()],
    [1, createFocusableInput()],
    [2, createFocusableInput()],
  ]);

  inputRefs.delete(2);

  assert.equal(isLastConnectedInputOrder(inputRefs, 1), true);
  assert.equal(isLastConnectedInputOrder(inputRefs, 0), false);
});

test('assignRef supports function refs and object refs', () => {
  const calls: Array<FocusableInput | null> = [];
  const objectRef: { current: FocusableInput | null } = { current: null };
  const input = createFocusableInput();

  assignRef((value) => {
    calls.push(value);
  }, input);
  assignRef(objectRef, input);
  assignRef(objectRef, null);

  assert.deepEqual(calls, [input]);
  assert.equal(objectRef.current, null);
});

test('composeRefs forwards the same value to every provided ref', () => {
  const calls: Array<FocusableInput | null> = [];
  const objectRef: { current: FocusableInput | null } = { current: null };
  const input = createFocusableInput();
  const composedRef = composeRefs<FocusableInput>(
    (value) => {
      calls.push(value);
    },
    undefined,
    objectRef
  );

  composedRef(input);

  assert.deepEqual(calls, [input]);
  assert.equal(objectRef.current, input);
});

test('callAll forwards args to every defined callback and ignores empty slots', () => {
  const calls: unknown[][] = [];
  const handler = callAll(
    (...args: unknown[]) => {
      calls.push(args);
    },
    undefined,
    (...args: unknown[]) => {
      calls.push(args);
    }
  );

  handler('first', 2, true);

  assert.deepEqual(calls, [
    ['first', 2, true],
    ['first', 2, true],
  ]);
});
