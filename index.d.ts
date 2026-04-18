declare module 'react-native-connected-inputs' {
  import { ReactElement, ReactNode, Ref } from 'react';
  import { ReturnKeyTypeOptions } from 'react-native';

  export interface FocusableInput {
    focus: () => void;
    blur?: () => void;
  }

  export type SubmitEditingHandler = (...args: unknown[]) => void;

  export interface ConnectedInputOptions {
    ref?: Ref<FocusableInput>;
    onSubmitEditing?: SubmitEditingHandler;
  }

  export interface ConnectedInputProps {
    ref: (input: FocusableInput | null) => void;
    onSubmitEditing: SubmitEditingHandler;
    returnKeyType: ReturnKeyTypeOptions;
    blurOnSubmit: boolean;
  }

  export function useConnectedInputs(
    onSubmit?: () => void
  ): (order: number, options?: ConnectedInputOptions) => ConnectedInputProps;

  export interface ConnectedInputsProps {
    children?: ReactNode;
    isInput?: (child: ReactElement) => boolean;
    onSubmit?: () => void;
  }

  export const ConnectedInputs: React.FC<ConnectedInputsProps>;

  export interface ConnectedInputsContextType {
    registerInput: (order: number, input: FocusableInput | null) => void;
    connectInput: (order: number, options?: ConnectedInputOptions) => ConnectedInputProps;
    handleSubmit: (onSubmit?: () => void) => void;
  }

  export const ConnectedInputsProvider: React.FC<{ children: ReactNode }>;

  export function useConnectedInputsContext(): ConnectedInputsContextType;
}
