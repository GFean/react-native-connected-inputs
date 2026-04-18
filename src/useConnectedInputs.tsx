import { useEffect } from 'react';

import useConnectedInputsRegistry from './useConnectedInputsRegistry';

const useConnectedInputs = (onSubmit?: () => void) => {
  const { connectInput, setSubmitHandler } = useConnectedInputsRegistry();

  useEffect(() => {
    setSubmitHandler(onSubmit);
  }, [onSubmit, setSubmitHandler]);

  return connectInput;
};

export default useConnectedInputs;
