import cls from 'classnames';
import { MdBoxLazy } from '@coze-arch/bot-md-box/lazy';

import css from './markdown-viewer.module.less';

interface MarkdownViewerProps {
  value: string;
  className?: string;
}

export const MarkdownBoxViewer: React.FC<MarkdownViewerProps> = ({
  value,
  className,
}) => (
  <div className={cls(css['md-box-viewer'], className)}>
    <MdBoxLazy markDown={value} />
  </div>
);
