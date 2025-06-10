import React from 'react';

export const MockSwitch = (props: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) => {
  const { checked, onChange } = props;
  return (
    <button onClick={() => onChange(!checked)}>
      {checked ? 'switch on' : 'switch off'}
    </button>
  );
};
