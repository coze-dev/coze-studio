import React, { useImperativeHandle, useState } from 'react';

export const MockTextArea = React.forwardRef(
  (
    props: {
      placeHolder: string;
    },
    ref,
  ) => {
    const { placeHolder } = props;
    const [value, setValue] = useState('');
    useImperativeHandle(ref, () => ({
      value,
    }));
    return (
      <input
        placeholder={placeHolder}
        value={value}
        onChange={v => {
          setValue(v.target.value);
        }}
        role="mock-textarea"
      />
    );
  },
);
