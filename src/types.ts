import { ReactElement } from "react";
import { TextInput } from "react-native";

export interface ConnectedInputsProps {
    children: ReactElement<any>[];
    onSubmit?: () => void;
  }

export interface ConnectedInput {
    ref: TextInput | null;
    onSubmitEditing: () => void;
  }