import cls from 'classnames';
import { CascaderProps } from '@douyinfe/semi-ui/lib/es/cascader';
import { Cascader, withField } from '@douyinfe/semi-ui';

import s from './index.module.less';

export function UICascader({
  dropdownClassName,
  className,
  ...props
}: CascaderProps) {
  return (
    <Cascader
      {...props}
      className={cls(className, s['ui-cascader'])}
      dropdownClassName={cls(dropdownClassName, s['ui-cascader-dropdown'])}
    />
  );
}

UICascader.FormItem = withField(UICascader);
export default UICascader;
