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
