import classNames from 'classnames';

import s from '../../index.module.less';
import { type ISysConfigItem } from '../../hooks';

export const VariableTree = (props: {
  isReadonly?: boolean;
  highLight?: boolean;
  activeId?: string;
  configList: ISysConfigItem[];
}) => {
  const { isReadonly, highLight, activeId, configList } = props;

  return (
    <tbody className="overflow-visible flex-1 h-0">
      {configList.map((item: ISysConfigItem, index: number) => (
        <tr
          key={`memory-row-list_${index}`}
          className={classNames(
            s['memory-row'],
            activeId === item.id && highLight && s['active-row'],
            activeId === item.id && highLight && 'active-row',
            'flex gap-x-4 flex-nowrap',
          )}
        >
          {item.key ? <td>{item.key}</td> : null}
          {item.description ? <td>{item.description}</td> : null}
          {item.default_value ? <td>{item.default_value}</td> : null}
          {item.channel ? <td>{item.channel}</td> : null}
          {item.method && !isReadonly ? <td>{item.method}</td> : null}
        </tr>
      ))}
    </tbody>
  );
};
