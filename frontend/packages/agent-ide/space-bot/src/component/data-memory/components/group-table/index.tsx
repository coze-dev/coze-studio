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

import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Spin, IconButton } from '@coze-arch/coze-design';
import { IconAdd } from '@coze-arch/bot-icons';

import { VariableTree } from '../variable-tree';
import { VariableGroupWrapper } from '../group-wrapper';
import s from '../../index.module.less';
import { type ISysConfigItemGroup, type ISysConfigItem } from '../../hooks';

const DEFAULT_VARIABLE_LENGTH = 10;

export const GroupTable = (props: {
  isReadonly?: boolean;
  loading?: boolean;
  highLight?: boolean;
  activeId?: string;
  subGroupConfig?: ISysConfigItemGroup[];
  variablesConfig?: ISysConfigItem[];
  handleInputedClick: () => void;
  hideAddButton?: boolean;
  header?: React.ReactNode;
}) => {
  const {
    isReadonly,
    loading,
    highLight,
    activeId,
    subGroupConfig,
    variablesConfig,
    handleInputedClick,
    hideAddButton,
    header,
  } = props;
  const showAddButton = !isReadonly && !hideAddButton;

  return (
    <table className={cls(s['memory-edit-table'], 'pl-6')}>
      {header}
      {loading ? (
        <Spin
          spinning={loading}
          style={{ width: '100%', height: '100%' }}
        ></Spin>
      ) : (
        <>
          {subGroupConfig?.map(subGroup => (
            <VariableGroupWrapper variableGroup={subGroup} level={1}>
              <VariableTree
                isReadonly={isReadonly}
                highLight={highLight}
                activeId={activeId}
                configList={subGroup.var_info_list}
              />
              {showAddButton &&
              subGroup.var_info_list?.length < DEFAULT_VARIABLE_LENGTH ? (
                <div className="my-3 text-left">
                  <IconButton
                    className="!m-0"
                    onClick={() => handleInputedClick()}
                    icon={<IconAdd />}
                  >
                    {I18n.t('bot_userProfile_add')}
                  </IconButton>
                </div>
              ) : null}
            </VariableGroupWrapper>
          ))}
          <VariableTree
            isReadonly={isReadonly}
            highLight={highLight}
            activeId={activeId}
            configList={variablesConfig}
          />
          {showAddButton &&
          variablesConfig?.length < DEFAULT_VARIABLE_LENGTH ? (
            <div className="my-3 text-left">
              <IconButton
                className="!m-0"
                onClick={() => handleInputedClick()}
                icon={<IconAdd />}
              >
                {I18n.t('bot_userProfile_add')}
              </IconButton>
            </div>
          ) : null}
        </>
      )}
    </table>
  );
};
