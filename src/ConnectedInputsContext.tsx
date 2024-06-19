import React, { createContext, useContext, useRef, useCallback, useState, useEffect } from 'react';
import { TextInput, ReturnKeyTypeOptions } from 'react-native';
import { ConnectedInput, ConnectedInputsContextType } from './types';

const ConnectedInputsContext = createContext<ConnectedInputsContextType | undefined>(undefined);

export const ConnectedInputsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const inputRefs = useRef<ConnectedInput[]>([]);
  const onSubmitRef = useRef<(() => void) | null>(null);
  const [totalInputs, setTotalInputs] = useState(0);

  const registerInput = useCallback((order: number, input: TextInput | null) => {
    inputRefs.current[order] = { ref: input, onSubmitEditing: () => handleSubmitEditing(order) };
    setTotalInputs(inputRefs.current.filter(ref => ref.ref !== null).length);
  }, []);

  const handleSubmitEditing = useCallback((order: number) => {
    for (let i = order + 1; i < inputRefs.current.length; i++) {
      if (inputRefs.current[i]?.ref) {
        inputRefs.current[i].ref?.focus();
        return;
      }
    }
    inputRefs.current[order]?.ref?.blur();
    if (onSubmitRef.current) {
      onSubmitRef.current();
    }
  }, []);

  const connectInput = useCallback((order: number) => {
    const isLastInput = order === totalInputs - 1;
    return {
      ref: (input: TextInput | null) => registerInput(order, input),
      onSubmitEditing: () => handleSubmitEditing(order),
      returnKeyType: (isLastInput ? 'done' : 'next') as ReturnKeyTypeOptions,
      blurOnSubmit: isLastInput,
    };
  }, [registerInput, handleSubmitEditing, totalInputs]);

  const handleSubmit = useCallback((onSubmit: () => void) => {
    onSubmitRef.current = onSubmit;
  }, []);

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
