import assert from 'node:assert/strict';
import test from 'node:test';

import React from 'react';

import { mapConnectedChildren } from '../src/connectedInputTree';

const FakeInput = () => null;
const Wrapper = ({ children }: { children?: React.ReactNode }) =>
  React.createElement('Wrapper', null, children);

test('mapConnectedChildren decorates nested matching children in order', () => {
  const tree = React.createElement(
    Wrapper,
    null,
    React.createElement(FakeInput, { name: 'first' }),
    React.createElement(
      React.Fragment,
      null,
      React.createElement('Label', { value: 'ignore' }),
      React.createElement(FakeInput, { name: 'last' })
    )
  );

  const mapped = mapConnectedChildren(
    tree,
    (child) => child.type === FakeInput,
    (child, order) => React.cloneElement(child, { order })
  );

  const root = React.Children.toArray(mapped)[0] as React.ReactElement<{ children: React.ReactNode }>;
  const directChildren = React.Children.toArray(root.props.children) as React.ReactElement[];
  const firstInput = directChildren[0] as React.ReactElement<{ order: number }>;
  const nestedFragment = directChildren[1] as React.ReactElement<{ children: React.ReactNode }>;
  const nestedChildren = React.Children.toArray(nestedFragment.props.children) as React.ReactElement[];
  const lastInput = nestedChildren[1] as React.ReactElement<{ order: number }>;

  assert.equal(firstInput.props.order, 0);
  assert.equal(lastInput.props.order, 1);
});

test('mapConnectedChildren handles a single child without throwing', () => {
  const tree = React.createElement(FakeInput, { name: 'only' });

  const mapped = mapConnectedChildren(
    tree,
    (child) => child.type === FakeInput,
    (child, order) => React.cloneElement(child, { order })
  );

  const onlyInput = React.Children.toArray(mapped)[0] as React.ReactElement<{ order: number }>;

  assert.equal(onlyInput.props.order, 0);
});

test('mapConnectedChildren preserves primitive and empty children', () => {
  const tree = React.createElement(
    Wrapper,
    null,
    'plain-text',
    null,
    React.createElement(FakeInput, { name: 'only' }),
    42
  );

  const mapped = mapConnectedChildren(
    tree,
    (child) => child.type === FakeInput,
    (child, order) => React.cloneElement(child, { order })
  );

  const root = React.Children.toArray(mapped)[0] as React.ReactElement<{ children: React.ReactNode }>;
  const children = React.Children.toArray(root.props.children);
  const onlyInput = children[1] as React.ReactElement<{ order: number }>;

  assert.equal(children[0], 'plain-text');
  assert.equal(onlyInput.props.order, 0);
  assert.equal(children[2], 42);
});
