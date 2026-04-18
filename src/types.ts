import type { ReactElement, ReactNode, Ref } from 'react';
import type { ReturnKeyTypeOptions } from 'react-native';

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

export interface ConnectedInputsProps {
  children?: ReactNode;
  isInput?: (child: ReactElement) => boolean;
  onSubmit?: () => void;
}

export interface ConnectedInputsContextType {
  registerInput: (order: number, input: FocusableInput | null) => void;
  connectInput: (order: number, options?: ConnectedInputOptions) => ConnectedInputProps;
  handleSubmit: (onSubmit?: () => void) => void;
}
