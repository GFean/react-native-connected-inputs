# @gfean/react-native-connected-inputs

<div>
  <img src="gifs/demogif.gif" alt="Gif demo" width="400" />
</div>

```react-native-connected-input``` lets you connect your text inputs with each other in the react-native app.
The package contains a react native custom hook and a HOC to manage smooth navigation thorugh inputs and submission handling.
This package is pure and has no peer dependencies, making it lightweight and easy to integrate into any React Native project. 
It uses base React Native components and is compatible with any kind of ```TextInput``` which accepts refs.

## Features

* Auto Navigation: Automatically navigates to the next input upon submission.
* Flexible Submission Handling: Execute custom logic when the last input is submitted.
* Pure Package: No additional peer dependencies.
* Lightweight: Minimal impact on your bundle size.
* Base Components: Utilizes base React Native components.
* Compatibility: Works with any type of input component.


## Installation

Install the package using npm or yarn:

```bash
npm install @gfean/react-native-connected-inputs
```
or
```bash
yarn add @gfean/react-native-connected-inputs
```

## Usage

### Hook: useConnectedInputs:
The ```useConnectedInputs``` hook allows you to connect multiple inputs, automatically managing focus (as well as the focus order) and submission.

```jsx
import React from 'react';
import { SafeAreaView, TextInput, StyleSheet, Alert } from 'react-native';
import { useConnectedInputs } from '@gfean/react-native-connected-inputs';

const App: React.FC = () => {
  const handleFormSubmit = () => {
    Alert.alert('Form Submitted');
  };

  const connectInput = useConnectedInputs(handleFormSubmit);

  return (
    <SafeAreaView style={styles.container}>
      <TextInput style={styles.input} placeholder="First Input" {...connectInput(0)} />
      <TextInput style={styles.input} placeholder="Second Input" {...connectInput(1)} />
      <TextInput style={styles.input} placeholder="Third Input" {...connectInput(2)} />
      <TextInput style={styles.input} placeholder="Fourth Input" {...connectInput(3)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    width: '80%',
  },
});

export default App;

```
### HOC: ConnectedInputs
```jsx
import React from 'react';
import { SafeAreaView, TextInput, StyleSheet, Alert, Text } from 'react-native';
import { ConnectedInputs } from '@gfean/react-native-connected-inputs';

const App: React.FC = () => {
  const handleFormSubmit = () => {
    Alert.alert('Form Submitted');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ConnectedInputs onSubmit={handleFormSubmit}>
        <TextInput style={styles.input} placeholder="First Input" />
        <Text>Hi there</Text>
        <TextInput style={styles.input} placeholder="Second Input" />
        <TextInput style={styles.input} placeholder="Third Input" />
        <TextInput style={styles.input} placeholder="Fourth Input" />
      </ConnectedInputs>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    width: '80%',
  },
});

export default App;

```
## API

## useConnectedInputs(onSubmit?: () => void)
A hook to manage connected inputs.

#### Parameters
```onSubmit``` (optional): A callback function to be called when the last input is submitted.
#### Returns
A function to connect an input, which takes the order of the input as an argument and returns props to be spread onto the input.

## ConnectedInputs
A higher-order component to manage connected inputs.
#### Props
* ```children```: The input components to be connected.
* ```onSubmit``` (optional): A callback function to be called when the last input is submitted.

You can wrap this around other elements than TextInputs as well, as given in the example above - this will type check for TextInput component and won't create additional refs for any other type of components.

## Note
This package will only help you to connect TextInputs, manage navigation and submission handling as well as the ```returnKeyType```. This is not responsible for keyboard avoiding views, but it works well with different community packages which manage keyboards. 

## Contributing
Contributions are welcome! If you find any issues or would like to suggest improvements, please create a new issue or submit a pull request.

## License
This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).

## Dependencies
No dependencies.