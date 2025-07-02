import { useRef, type PropsWithChildren } from 'react';

import classNames from 'classnames';
import { BotMode } from '@coze-arch/bot-api/developer_api';

import s from './index.module.less';

interface ContentViewProps {
  mode: number;
  className?: string;
  style?: React.CSSProperties;
}
export const ContentView: React.FC<PropsWithChildren<ContentViewProps>> = ({
  mode = 1,
  className,
  style,
  children,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const isSingle = mode === BotMode.SingleMode;
  const isMulti = mode === BotMode.MultiMode;
  return (
    <div
      className={classNames(
        'w-full h-full overflow-hidden',
        isSingle && s['wrapper-single'],
        isMulti && s['wrapper-multi'],
        className,
      )}
      style={style}
      ref={wrapperRef}
    >
      {children}
    </div>
  );
};

export default ContentView;
