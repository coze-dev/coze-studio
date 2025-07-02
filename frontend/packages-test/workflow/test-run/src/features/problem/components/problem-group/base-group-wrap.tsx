import css from './base-group-wrap.module.less';

interface BaseGroupWrapProps {
  title?: React.ReactNode;
}

export const BaseGroupWrap: React.FC<
  React.PropsWithChildren<BaseGroupWrapProps>
> = ({ title, children }) => (
  <div className={css['group-wrap']}>
    {title ? <div className={css.title}>{title}</div> : null}
    {children}
  </div>
);
