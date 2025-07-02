import classNames from 'classnames';

export const getEditorWordsCls = () =>
  classNames(
    // 换行
    '[&_p]:break-words [&_p]:whitespace-pre-wrap',
    // 保留所有空格和换行符
    '[&_.ProseMirror_*]:break-words [&_.ProseMirror_*]:whitespace-pre-wrap',
    // 段落
    '[&_.editor-paragraph]:min-h-[1.5em] [&_.editor-paragraph]:leading-normal',
    // 空段落
    '[&_.editor-paragraph:empty]:min-h-[1.5em] [&_.editor-paragraph:empty]:block',
  );
