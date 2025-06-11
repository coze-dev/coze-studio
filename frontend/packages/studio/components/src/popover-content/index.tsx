import React, {
  Suspense,
  lazy,
  type PropsWithChildren,
  type ReactNode,
  type CSSProperties,
} from 'react';

import classNames from 'classnames';

import s from './index.module.less';
// react-markdown 20ms 左右的 longtask
const LazyReactMarkdown = lazy(() => import('react-markdown'));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactMarkdown = (props: any) => (
  <Suspense fallback={null}>
    <LazyReactMarkdown {...props} />
  </Suspense>
);
export const PopoverContent: React.FC<
  PropsWithChildren & {
    text?: string;
    node?: ReactNode;
    className?: string;
    style?: CSSProperties;
  }
> = ({ children, className, style }) => (
  <div className={classNames(s['tip-content'], className)} style={style}>
    {typeof children === 'string' ? (
      <ReactMarkdown skipHtml={true} className={s.markdown}>
        {children}
      </ReactMarkdown>
    ) : (
      children
    )}
  </div>
);
