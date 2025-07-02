import s from './index.module.less';

export const Container = ({ children }: { children: React.ReactNode }) => (
  <div className={s.container}>{children}</div>
);
