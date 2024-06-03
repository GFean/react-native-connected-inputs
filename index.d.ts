declare module 'react-native-connected-inputs' {
  import { TextInput, ReturnKeyTypeOptions } from 'react-native';
  import { ReactElement } from 'react';

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
}
