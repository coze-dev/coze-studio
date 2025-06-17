import { I18n, type I18nKeysNoOptionsType } from '@coze-arch/i18n';
import { IconCozInfinity } from '@coze-arch/coze-design/icons';
import { Tag, Tooltip } from '@coze-arch/coze-design';

import { type DependencyOrigin, type NodeType } from '../../typings';
import { contentMap, getFromText } from './constants';

import s from './index.module.less';

export const Tags = ({
  type,
  from,
  loop,
  version,
}: {
  type: NodeType;
  from: DependencyOrigin;
  loop?: boolean;
  version?: string;
}) => {
  const typeText = contentMap[type] as I18nKeysNoOptionsType;
  const fromText = getFromText[from] as I18nKeysNoOptionsType;

  return (
    <div className={s['tag-container']}>
      <Tag className={s.tag} color="primary">
        {I18n.t(typeText)}
      </Tag>
      {fromText ? (
        <Tag className={s.tag} color="primary">
          {I18n.t(fromText)}
        </Tag>
      ) : null}
      {version ? (
        <Tag className={s.tag} color="primary">
          {version}
        </Tag>
      ) : null}
      {loop ? (
        <Tooltip content={I18n.t('reference_graph_node_loop_tip')} theme="dark">
          <Tag className={s.tag} color="primary">
            <IconCozInfinity style={{ fill: 'var(--coz-fg-hglt)' }} />
          </Tag>
        </Tooltip>
      ) : null}
    </div>
  );
};
