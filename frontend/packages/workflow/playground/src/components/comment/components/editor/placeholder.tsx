import { type FC } from 'react';

import { type RenderPlaceholderProps } from 'slate-react';

export const Placeholder: FC<RenderPlaceholderProps> = props => {
  const { children, attributes } = props;
  return (
    <div
      {...attributes}
      className="workflow-comment-editor-placeholder text-[12px] text-[var(--coz-fg-dim)] overflow-hidden absolute pointer-events-none w-full select-none decoration-clone"
      style={
        {
          // 覆盖 slate 内置样式
        }
      }
    >
      <p>{children}</p>
    </div>
  );
};
