import React, { Children, cloneElement, useRef, ReactElement, isValidElement, Fragment } from 'react';
import { TextInput } from 'react-native';

interface ConnectedInputsProps {
  children: ReactElement<any>[];
  onSubmit?: () => void;
}

const ConnectedInputs: React.FC<ConnectedInputsProps> = ({ children, onSubmit }) => {
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleSubmitEditing = (index: number) => {
    for (let i = index + 1; i < inputRefs.current.length; i++) {
      if (inputRefs.current[i]) {
        inputRefs.current[i]?.focus();
        return;
      }
    }
    inputRefs.current[index]?.blur();
    if (onSubmit) {
      onSubmit();
    }
  };

  const childrenWithProps = Children.map(children, (child, index) => {
    if (!isValidElement(child) || child.type !== TextInput) {
      return child;
    }

    const isLastInput = children.reduce(
      (acc, curr, currIndex) => (isValidElement(curr) && curr.type === TextInput ? currIndex : acc),
      index
    ) === index;

    return cloneElement(child, {
      // @ts-ignore
      ref: (ref: TextInput | null) => (inputRefs.current[index] = ref),
      onSubmitEditing: () => handleSubmitEditing(index),
      returnKeyType: isLastInput ? 'done' : 'next',
      blurOnSubmit: isLastInput,
    });
  });

  return <Fragment>{childrenWithProps}</Fragment>;
};

export default ConnectedInputs;
