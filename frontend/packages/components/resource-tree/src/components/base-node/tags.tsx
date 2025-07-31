/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
