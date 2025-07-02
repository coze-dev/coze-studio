import s from './index.module.less';

export const ProgressMask: React.FC<{ percent: number }> = ({ percent }) => (
  <div className={s['progress-mask']} style={{ width: `${percent}%` }} />
);
