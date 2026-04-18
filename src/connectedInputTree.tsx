import React, { Children, ReactElement, ReactNode, cloneElement, isValidElement } from 'react';

export const mapConnectedChildren = (
  children: ReactNode,
  isInput: (child: ReactElement) => boolean,
  decorateInput: (child: ReactElement, order: number) => ReactElement
) => {
  let order = 0;

  const walk = (nodes: ReactNode): ReactNode =>
    Children.map(nodes, (child) => {
      if (!isValidElement(child)) {
        return child;
      }

      const element = child as ReactElement<any>;

      if (isInput(element)) {
        const currentOrder = order;
        order += 1;

        return decorateInput(element, currentOrder);
      }

      if (element.props.children === undefined) {
        return element;
      }

      return cloneElement(element, undefined, walk(element.props.children));
    });

  return walk(children);
};
