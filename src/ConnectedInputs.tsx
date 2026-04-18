import React, { Fragment, ReactElement, Ref, cloneElement } from 'react';
import { TextInput } from 'react-native';

import { mapConnectedChildren } from './connectedInputTree';
import { ConnectedInputsProps, FocusableInput } from './types';
import useConnectedInputs from './useConnectedInputs';

const defaultIsInput = (child: ReactElement) => child.type === TextInput;

const getElementRef = (child: ReactElement): Ref<FocusableInput> | undefined =>
  (child as ReactElement & { ref?: Ref<FocusableInput> }).ref;

const ConnectedInputs: React.FC<ConnectedInputsProps> = ({
  children,
  isInput = defaultIsInput,
  onSubmit,
}) => {
  const connectInput = useConnectedInputs(onSubmit);

  const childrenWithProps = mapConnectedChildren(children, isInput, (child, order) => {
    const childProps = child.props as { onSubmitEditing?: (...args: unknown[]) => void };
    const connectedProps = connectInput(order, {
      ref: getElementRef(child),
      onSubmitEditing: childProps.onSubmitEditing,
    });

    return cloneElement(child, connectedProps);
  });

  return <Fragment>{childrenWithProps}</Fragment>;
};

export default ConnectedInputs;
