import React, { createContext, useCallback, useContext } from 'react';

import useConnectedInputsRegistry from './useConnectedInputsRegistry';
import { ConnectedInputsContextType } from './types';

const ConnectedInputsContext = createContext<ConnectedInputsContextType | undefined>(undefined);

export const ConnectedInputsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { connectInput, registerInput, setSubmitHandler } = useConnectedInputsRegistry();

  const handleSubmit = useCallback((onSubmit?: () => void) => {
    setSubmitHandler(onSubmit);
  }, [setSubmitHandler]);

  return (
    <ConnectedInputsContext.Provider value={{ registerInput, connectInput, handleSubmit }}>
      {children}
    </ConnectedInputsContext.Provider>
  );
};

export const useConnectedInputsContext = () => {
  const context = useContext(ConnectedInputsContext);
  if (!context) {
    throw new Error('useConnectedInputsContext must be used within a ConnectedInputsProvider');
  }

  return context;
};
