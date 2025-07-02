import { useState } from 'react';

export const useFormSubmitState = <T>({
  initialValues,
  getIsFormValid,
}: {
  initialValues?: T;
  getIsFormValid: (values: T) => boolean;
}) => {
  const [isFormValid, setFormValid] = useState(
    initialValues ? getIsFormValid(initialValues) : true,
  );
  const [isUploading, setUploading] = useState(false);

  const checkFormValid = (values: T) => {
    setFormValid(getIsFormValid(values));
  };

  const onValuesChange = (values: T) => {
    checkFormValid(values);
  };
  const onBeforeUpload = () => {
    setUploading(true);
  };

  const onAfterUpload = () => {
    setUploading(false);
  };

  return {
    isSubmitDisabled: !isFormValid || isUploading,
    checkFormValid,
    bizCallback: {
      onValuesChange,
      onBeforeUpload,
      onAfterUpload,
    },
  };
};
