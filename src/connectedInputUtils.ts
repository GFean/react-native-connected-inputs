import type { MutableRefObject, Ref } from 'react';

import type { FocusableInput, SubmitEditingHandler } from './types';

export const getRegisteredOrders = (inputRefs: Map<number, FocusableInput | null>): number[] =>
  Array.from(inputRefs.entries())
    .filter(([, input]) => input !== null)
    .map(([order]) => order)
    .sort((left, right) => left - right);

export const getNextConnectedInputOrder = (
  inputRefs: Map<number, FocusableInput | null>,
  currentOrder: number
): number | null => {
  const registeredOrders = getRegisteredOrders(inputRefs);

  for (const registeredOrder of registeredOrders) {
    if (registeredOrder > currentOrder) {
      return registeredOrder;
    }
  }

  return null;
};

export const isLastConnectedInputOrder = (
  inputRefs: Map<number, FocusableInput | null>,
  currentOrder: number
): boolean => {
  const registeredOrders = getRegisteredOrders(inputRefs);

  return (
    registeredOrders.length > 0 &&
    registeredOrders[registeredOrders.length - 1] === currentOrder
  );
};

export const assignRef = <T>(ref: Ref<T> | undefined, value: T | null) => {
  if (typeof ref === 'function') {
    ref(value);
    return;
  }

  if (ref && 'current' in ref) {
    (ref as MutableRefObject<T | null>).current = value;
  }
};

export const composeRefs = <T>(...refs: Array<Ref<T> | undefined>) => (value: T | null) => {
  refs.forEach((ref) => assignRef(ref, value));
};

export const callAll =
  (...callbacks: Array<SubmitEditingHandler | undefined>) =>
  (...args: unknown[]) => {
    callbacks.forEach((callback) => callback?.(...args));
  };
