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

import { type FC, type PropsWithChildren, Children, useEffect } from 'react';

import classNames from 'classnames';
import { AbilityScope } from '@coze-agent-ide/tool-config';
import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';

import { AgentSkillContentBlock } from '../agent-skill-content-block';
import { AgentSkillContainer } from '../agent-skill-container';
import { hasValidAgentSkillKey } from '../../utils/has-valid-key';
import { useSubscribeToolStore } from '../../hooks/public/store/use-tool-store';
import { useHasAgentSkill } from '../../hooks/public/agent/use-has-agent-skill';
import { useRegisterAgentSkillKey } from '../../hooks/builtin/use-register-agent-skill-key';
import { useNoneAgentSkill } from '../../hooks/agent-skill/use-agent-skill';

import styles from './index.module.less';

interface IProps {
  title: string;
  agentId: string;
  className?: string;
  style?: React.CSSProperties;
  actionButton?: React.ReactNode;
  emptyText: string;
}

export const AgentSkillView: FC<PropsWithChildren<IProps>> = ({
  children,
  agentId,
  title,
  className,
  style,
  actionButton,
  emptyText,
}) => {
  const readonly = useBotDetailIsReadonly();

  const registerAgentSkillKey = useRegisterAgentSkillKey();
  const noneAgentSkill = useNoneAgentSkill();
  const { getHasAgentSkill } = useHasAgentSkill();

  useSubscribeToolStore(AbilityScope.AGENT_SKILL, agentId);

  // pre-registration
  useEffect(() => {
    Children.map(children, child => {
      if (!hasValidAgentSkillKey(child)) {
        return child;
      }

      const agentSkillKey = child.key;

      registerAgentSkillKey(agentSkillKey);
    });
  }, [children]);

  return (
    <AgentSkillContentBlock
      title={title}
      className={classNames(styles.container, className)}
      style={style}
      actionButton={!readonly && actionButton}
    >
      {noneAgentSkill ? (
        <span className={styles.empty}>{emptyText}</span>
      ) : (
        <div className={styles.content}>
          {Children.map(children, child => {
            if (
              typeof child === 'string' ||
              typeof child === 'number' ||
              typeof child === 'boolean'
            ) {
              return child;
            }
            if (!hasValidAgentSkillKey(child)) {
              return child;
            }
            const agentSkillKey = child.key;
            const hasAgentSkill = getHasAgentSkill(agentSkillKey);
            return (
              hasAgentSkill && (
                <AgentSkillContainer agentSkillKey={agentSkillKey}>
                  <>{child}</>
                </AgentSkillContainer>
              )
            );
          })}
        </div>
      )}
    </AgentSkillContentBlock>
  );
};
