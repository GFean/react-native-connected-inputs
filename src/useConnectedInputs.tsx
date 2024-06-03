import { useRef, useCallback } from 'react';
import { TextInput, ReturnKeyTypeOptions } from 'react-native';
import { ConnectedInput } from './types';



const useConnectedInputs = (onSubmit?: () => void) => {
  const inputRefs = useRef<ConnectedInput[]>([]);

  const registerInput = useCallback((order: number, input: TextInput | null) => {
    inputRefs.current[order] = { ref: input, onSubmitEditing: () => handleSubmitEditing(order) };
  }, []);

  const handleSubmitEditing = useCallback((order: number) => {
    // Find the next TextInput ref that is not null
    for (let i = order + 1; i < inputRefs.current.length; i++) {
      if (inputRefs.current[i]?.ref) {
        inputRefs.current[i].ref?.focus();
        return;
      }
    }
    // If no next input is found, blur the current one and call onSubmit
    inputRefs.current[order]?.ref?.blur();
    if (onSubmit) {
      onSubmit();
    }
  }, [onSubmit]);

  const connectInput = useCallback((order: number) => ({
    ref: (input: TextInput | null) => registerInput(order, input),
    onSubmitEditing: () => handleSubmitEditing(order),
    returnKeyType: ((inputRefs.current.filter(ref => ref && ref.ref !== null).length === order + 1) ? 'done' : 'next') as ReturnKeyTypeOptions,
    blurOnSubmit: inputRefs.current.filter(ref => ref && ref.ref !== null).length === order + 1,
  }), [registerInput, handleSubmitEditing]);

  return connectInput;
};

export default useConnectedInputs;
