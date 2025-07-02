import { CommentEditorLeafFormat, CommentDefaultLink } from '../../constant';

export const Leaf = ({ attributes, children, leaf }) => {
  if (leaf[CommentEditorLeafFormat.Bold]) {
    children = <strong>{children}</strong>;
  }

  if (leaf[CommentEditorLeafFormat.Strikethrough]) {
    children = <del>{children}</del>;
  }

  if (leaf[CommentEditorLeafFormat.Italic]) {
    children = <em>{children}</em>;
  }

  if (leaf[CommentEditorLeafFormat.Underline]) {
    children = <u>{children}</u>;
  }

  if (leaf[CommentEditorLeafFormat.Link]) {
    children = (
      <a
        className="text-[var(--semi-color-link)] cursor-pointer"
        href={leaf[CommentEditorLeafFormat.Link]}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          const link: string = leaf[CommentEditorLeafFormat.Link];
          if (link === CommentDefaultLink) {
            // 如果链接为默认链接，直接打开
            return window.open(link, '_blank');
          } else if (/^([a-zA-Z][a-zA-Z\d+\-.]*):\/\//.test(link)) {
            // 如果已经包含合法的协议，直接打开
            return window.open(link, '_blank');
          } else {
            // 如果没有合法协议，添加 https 协议头
            // cp-disable-next-line
            return window.open(`https://${link}`, '_blank');
          }
        }}
      >
        {children}
      </a>
    );
  }

  return <span {...attributes}>{children}</span>;
};
