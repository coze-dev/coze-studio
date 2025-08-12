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

import { useState, useEffect } from 'react';

import { type Form } from '@formily/core';

export const useFormSubmitting = (form: Form<any> | null) => {
  const [submitting, setSubmitting] = useState(!!form?.submitting);

  useEffect(() => {
    if (!form) {
      return;
    }
    const unsubscribe = form.subscribe(payload => {
      if (payload.type === 'onFormSubmitStart') {
        setSubmitting(true);
      } else if (payload.type === 'onFormSubmitEnd') {
        setSubmitting(false);
      }
    });
    return () => form.unsubscribe(unsubscribe);
  }, [form]);

  return submitting;
};
