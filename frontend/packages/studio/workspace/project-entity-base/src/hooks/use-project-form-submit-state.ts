/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
