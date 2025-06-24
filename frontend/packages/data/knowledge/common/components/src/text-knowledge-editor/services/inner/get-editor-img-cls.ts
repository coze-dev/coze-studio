import classNames from 'classnames';

export const getEditorImgClassname = () =>
  classNames(
    '[&_img]:relative [&_img]:block',
    '[&_img]:my-3 [&_img]:bg-white [&_img]:rounded-md',
    '[&_img.ProseMirror-selectednode]:outline-2 [&_img.ProseMirror-selectednode]:outline [&_img.ProseMirror-selectednode]:outline-blue-500',
    '[&_img.ProseMirror-selectednode]:shadow-md',
  );
