import React from 'react';

import clsx from 'clsx';

import { type SingleSelectLabelProps } from './single-select-types';

import './index.css';

const SingleSelectLabelComp = ({
  text,
  icon,
  activeIcon,
}: SingleSelectLabelProps) => {
  const cls = clsx([
    'coz-single-select-label',
    {
      'coz-single-select-label-icon-only': !!text,
    },
  ]);

  return (
    <div className={cls}>
      <span className="coz-single-select-label-icon-inactive">{icon}</span>
      <span className="coz-single-select-label-icon-active">
        {activeIcon || icon}
      </span>
      {text ? (
        <span className="coz-single-select-label-text">{text}</span>
      ) : null}
    </div>
  );
};

export const SingleSelectLabel = React.memo(SingleSelectLabelComp);
