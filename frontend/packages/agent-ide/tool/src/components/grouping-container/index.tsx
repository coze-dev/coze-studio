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

import { type FC, type ReactNode } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { isArray } from 'lodash-es';
import classnames from 'classnames';
import {
  TOOL_KEY_TO_API_STATUS_KEY_MAP,
  type ToolGroupKey,
} from '@coze-agent-ide/tool-config';
import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { useLayoutContext } from '@coze-arch/bot-hooks';
import { TabStatus } from '@coze-arch/bot-api/developer_api';

import { useRegisteredToolKeyConfigList } from '../../hooks/builtin/use-register-tool-key';
import { usePreference } from '../../context/preference-context';

import styles from './index.module.less';

/**
 * Packet container
 * @see
 */

interface IProps {
  children?: ReactNode;
  title: ReactNode;
  toolGroupKey?: ToolGroupKey;
  actionNodes?: ReactNode;
  className?: string;
}

export const GroupingContainer: FC<IProps> = props => {
  const { children, title, toolGroupKey, actionNodes, className } = props;
  // The placement of the container on the page is different in different position styles
  const { placement } = useLayoutContext();

  const { isReadonly } = usePreference();

  const registeredToolKeyConfigList = useRegisteredToolKeyConfigList();

  const registeredToolKeyListInGroup = registeredToolKeyConfigList.filter(
    toolConfig => toolConfig.toolGroupKey === toolGroupKey,
  );

  const statusKeys = registeredToolKeyListInGroup.map(
    toolConfig => TOOL_KEY_TO_API_STATUS_KEY_MAP[toolConfig.toolKey],
  );

  const { enableToolHiddenMode } = usePreference();

  const tabInvisible = usePageRuntimeStore(
    useShallow(state =>
      statusKeys
        .map(_key => state.botSkillBlockCollapsibleState[_key])
        .every(status => status === TabStatus.Hide),
    ),
  );

  const getInvisible = () => {
    if (!enableToolHiddenMode) {
      return false;
    }

    if (isReadonly) {
      return !registeredToolKeyListInGroup.some(
        toolConfig => toolConfig.hasValidData,
      );
    }

    return tabInvisible;
  };

  const invisible = getInvisible();

  if (!children || (isArray(children) && !children.length)) {
    return null;
  }

  return (
    <div
      className={classnames(styles[placement], 'coz-bg-plus', className, {
        hidden: invisible,
        [styles.wrapper || '']: !invisible,
      })}
    >
      <div className={styles.header}>
        <div className={classnames(styles.title, 'coz-fg-secondary')}>
          {title}
        </div>
        <div className={styles['action-nodes']}>{actionNodes}</div>
      </div>
      {children}
    </div>
  );
};
