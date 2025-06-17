import classNames from 'classnames';

export const getEditorImgClassname = () =>
  classNames(
    '[&>img]:relative [&>img]:block',
    '[&>img]:w-full',
    '[&>img]:h-auto',
    '[&>img]:my-3 [&>img]:bg-white [&>img]:rounded-md',
  );
