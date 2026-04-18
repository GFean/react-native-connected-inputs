import { useCallback, useRef, useState } from 'react';

import { ConnectedInputController, createConnectedInputController } from './connectedInputController';
import { ConnectedInputOptions, FocusableInput } from './types';

const useConnectedInputsRegistry = (): ConnectedInputController => {
  const controllerRef = useRef<ConnectedInputController>();
  const [, setRegistrationVersion] = useState(0);

  if (!controllerRef.current) {
    controllerRef.current = createConnectedInputController(() => {
      setRegistrationVersion((currentVersion) => currentVersion + 1);
    });
  }

  const connectInput = useCallback(
    (order: number, options?: ConnectedInputOptions) =>
      controllerRef.current!.connectInput(order, options),
    []
  );

  const registerInput = useCallback(
    (order: number, input: FocusableInput | null) =>
      controllerRef.current!.registerInput(order, input),
    []
  );

  const setSubmitHandler = useCallback(
    (nextSubmitHandler?: () => void) => controllerRef.current!.setSubmitHandler(nextSubmitHandler),
    []
  );

  return {
    connectInput,
    registerInput,
    setSubmitHandler,
  };
};

export default useConnectedInputsRegistry;
