import { ReturnKeyTypeOptions } from 'react-native';

import { assignRef } from './connectedInputUtils';
import {
  ConnectedInputOptions,
  ConnectedInputProps,
  FocusableInput,
  SubmitEditingHandler,
} from './types';

export interface ConnectedInputController {
  connectInput: (order: number, options?: ConnectedInputOptions) => ConnectedInputProps;
  registerInput: (order: number, input: FocusableInput | null) => void;
  setSubmitHandler: (onSubmit?: () => void) => void;
}

export const createConnectedInputController = (
  onRegistrationChange?: () => void
): ConnectedInputController => {
  const inputRefs = new Map<number, FocusableInput | null>();
  const registeredOrders: number[] = [];
  const externalRefs = new Map<number, ConnectedInputOptions['ref']>();
  const externalSubmitHandlers = new Map<number, SubmitEditingHandler | undefined>();
  const refCallbacks = new Map<number, ConnectedInputProps['ref']>();
  const submitHandlers = new Map<number, ConnectedInputProps['onSubmitEditing']>();
  let onSubmit: (() => void) | undefined;

  const findOrderIndex = (order: number): number => {
    let low = 0;
    let high = registeredOrders.length;

    while (low < high) {
      const mid = Math.floor((low + high) / 2);

      if (registeredOrders[mid] < order) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }

    return low;
  };

  const addRegisteredOrder = (order: number) => {
    const orderIndex = findOrderIndex(order);

    if (registeredOrders[orderIndex] !== order) {
      registeredOrders.splice(orderIndex, 0, order);
    }
  };

  const removeRegisteredOrder = (order: number) => {
    const orderIndex = findOrderIndex(order);

    if (registeredOrders[orderIndex] === order) {
      registeredOrders.splice(orderIndex, 1);
    }
  };

  const getNextRegisteredOrder = (currentOrder: number): number | null => {
    const orderIndex = findOrderIndex(currentOrder);

    if (registeredOrders[orderIndex] === currentOrder) {
      return registeredOrders[orderIndex + 1] ?? null;
    }

    return registeredOrders[orderIndex] ?? null;
  };

  const registerInput = (order: number, input: FocusableInput | null) => {
    const previousInput = inputRefs.get(order) ?? null;
    const previousLastOrder =
      registeredOrders.length > 0 ? registeredOrders[registeredOrders.length - 1] : null;

    if (previousInput === input) {
      return;
    }

    if (input === null) {
      inputRefs.delete(order);
      removeRegisteredOrder(order);
    } else {
      inputRefs.set(order, input);

      if (previousInput === null) {
        addRegisteredOrder(order);
      }
    }

    const nextLastOrder =
      registeredOrders.length > 0 ? registeredOrders[registeredOrders.length - 1] : null;

    if (previousLastOrder !== nextLastOrder) {
      onRegistrationChange?.();
    }
  };

  const setSubmitHandler = (nextSubmitHandler?: () => void) => {
    onSubmit = nextSubmitHandler;
  };

  const handleSubmitEditing = (order: number) => {
    const nextOrder = getNextRegisteredOrder(order);

    if (nextOrder !== null) {
      inputRefs.get(nextOrder)?.focus();
      return;
    }

    inputRefs.get(order)?.blur?.();
    onSubmit?.();
  };

  const getRefCallback = (order: number): ConnectedInputProps['ref'] => {
    const existingCallback = refCallbacks.get(order);

    if (existingCallback) {
      return existingCallback;
    }

    const callback: ConnectedInputProps['ref'] = (input) => {
      assignRef(externalRefs.get(order), input);
      registerInput(order, input);
    };

    refCallbacks.set(order, callback);

    return callback;
  };

  const getSubmitHandler = (order: number): ConnectedInputProps['onSubmitEditing'] => {
    const existingHandler = submitHandlers.get(order);

    if (existingHandler) {
      return existingHandler;
    }

    const handler: ConnectedInputProps['onSubmitEditing'] = (...args) => {
      externalSubmitHandlers.get(order)?.(...args);
      handleSubmitEditing(order);
    };

    submitHandlers.set(order, handler);

    return handler;
  };

  const connectInput = (
    order: number,
    options: ConnectedInputOptions = {}
  ): ConnectedInputProps => {
    const previousExternalRef = externalRefs.get(order);
    const currentInput = inputRefs.get(order) ?? null;

    if (previousExternalRef && previousExternalRef !== options.ref) {
      assignRef(previousExternalRef, null);
    }

    externalRefs.set(order, options.ref);

    if (options.ref && previousExternalRef !== options.ref && currentInput) {
      assignRef(options.ref, currentInput);
    }

    externalSubmitHandlers.set(order, options.onSubmitEditing);

    const isLastInput =
      registeredOrders.length > 0 &&
      registeredOrders[registeredOrders.length - 1] === order;

    return {
      ref: getRefCallback(order),
      onSubmitEditing: getSubmitHandler(order),
      returnKeyType: (isLastInput ? 'done' : 'next') as ReturnKeyTypeOptions,
      blurOnSubmit: isLastInput,
    };
  };

  return {
    connectInput,
    registerInput,
    setSubmitHandler,
  };
};
