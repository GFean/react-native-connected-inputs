declare module 'react-native-connected-inputs' {
  import { TextInput, ReturnKeyTypeOptions } from 'react-native';
  import { ReactElement, ReactNode } from 'react';

  interface ConnectedInput {
    ref: TextInput | null;
    order: number;
  }

  export function useConnectedInputs(
    onSubmit?: () => void
  ): (order: number) => {
    ref: (input: TextInput | null) => void;
    onSubmitEditing: () => void;
    returnKeyType: ReturnKeyTypeOptions;
    blurOnSubmit: boolean;
  };

  interface ConnectedInputsProps {
    children: ReactElement<any>[];
    onSubmit?: () => void;
  }

  export const ConnectedInputs: React.FC<ConnectedInputsProps>;

  interface ConnectedInputsContextType {
    registerInput: (order: number, input: TextInput | null) => void;
    connectInput: (order: number) => {
      ref: (input: TextInput | null) => void;
      onSubmitEditing: () => void;
      returnKeyType: ReturnKeyTypeOptions;
      blurOnSubmit: boolean;
    };
    handleSubmit: (onSubmit: () => void) => void;
  }

  export const ConnectedInputsProvider: React.FC<{ children: ReactNode }>;

  export function useConnectedInputsContext(): ConnectedInputsContextType;
}
