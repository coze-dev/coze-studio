import React from 'react';

import classNames from 'classnames';

import s from './index.module.less';

const Container = (props: {
  className?: string;
  children?: React.ReactNode;
  shadowMode?: 'default' | 'primary';
  onClick?: () => void;
}) => {
  const { className, children, onClick, shadowMode } = props;

  return (
    <div
      className={classNames(
        'coz-bg-max',
        s.container,
        s.width100,
        className,
        s[`shadow-${shadowMode}`],
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const SkeletonContainer = (props: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <div
    className={classNames(
      'coz-mg-primary',
      s.container,
      s.width100,
      s.skeleton,
      props.className,
    )}
  >
    {props?.children}
  </div>
);

export const CardContainer = Container;
export const CardSkeletonContainer = SkeletonContainer;
