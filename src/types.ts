import { ReactElement } from "react";
import { ReturnKeyTypeOptions, TextInput } from "react-native";

export interface ConnectedInputsProps {
    children: ReactElement<any>[];
    onSubmit?: () => void;
  }

export interface ConnectedInput {
    ref: TextInput | null;
    onSubmitEditing: () => void;
  }

export interface ConnectedInputsContextType {
  registerInput: (order: number, input: TextInput | null) => void;
  connectInput: (order: number) => {
    ref: (input: TextInput | null) => void;
    onSubmitEditing: () => void;
    returnKeyType: ReturnKeyTypeOptions;
    blurOnSubmit: boolean;
  };
  handleSubmit: (onSubmit: () => void) => void;
}