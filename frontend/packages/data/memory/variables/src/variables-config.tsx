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

import React, { useEffect, useRef } from 'react';

import { useShallow } from 'zustand/react/shallow';
import cls from 'classnames';
import { IllustrationNoContent } from '@douyinfe/semi-illustrations';
import { I18n } from '@coze-arch/i18n';
import { VariableChannel } from '@coze-arch/bot-api/memory';
import { IconCozCross } from '@coze-arch/coze-design/icons';
import {
  Button,
  Empty,
  Form,
  type FormApi,
  IconButton,
  Spin,
} from '@coze-arch/coze-design';

import { useVariableGroupsStore, type Variable } from '@/store';
import { useLeaveWarning } from '@/hooks/use-case/use-leave-waring';
import { useInit } from '@/hooks/life-cycle/use-init';
import { useDestory } from '@/hooks/life-cycle/use-destory';
import { VariableContext } from '@/context';
import { VariableGroup as VariableGroupComponent } from '@/components/variable-group';

import {
  checkProjectID,
  submit,
} from './service/use-case-service/submit-service';
import { useChangeWarning } from './hooks/use-case/use-change-warning';

export interface VariableConfigProps {
  projectID: string;
  version?: string;
}

export const VariablesConfig = ({
  projectID,
  version,
}: VariableConfigProps) => {
  const formApiRef = useRef<FormApi | null>(null);

  const { loading } = useInit(projectID, version);
  useDestory();
  const { setHasUnsavedChanges, hasUnsavedChanges } = useLeaveWarning();
  const { variableGroups, canEdit, saveHistory, getAllVariables } =
    useVariableGroupsStore(
      useShallow(state => ({
        variableGroups: state.variableGroups,
        canEdit: state.canEdit,
        saveHistory: state.saveHistory,
        getAllVariables: state.getAllVariables,
      })),
    );

  const { isShowBanner, showBanner, hideBanner, hideBannerForever } =
    useChangeWarning();

  const isEmpty = !variableGroups.length;

  const onVariableChange = (changeValue: Variable) => {
    setHasUnsavedChanges(true);
    if (changeValue.meta?.isHistory) {
      showBanner();
    }
  };

  const handleSubmit = async () => {
    if (!checkProjectID(projectID)) {
      return;
    }
    const formApi = formApiRef.current;
    if (!formApi) {
      return;
    }
    const isValid = await formApi.validate();
    if (!isValid) {
      return;
    }
    saveHistory();
    await submit(projectID);
    setHasUnsavedChanges(false);
  };

  const initValues = getAllVariables().reduce((acc, curr) => {
    acc[curr.variableId] = { name: curr.name };
    return acc;
  }, {});

  useEffect(() => {
    if (loading) {
      return;
    }
    formApiRef.current?.setValues(initValues);
  }, [loading, initValues]);

  return (
    <VariableContext.Provider
      value={{
        variablePageCanEdit: canEdit,
        groups: variableGroups,
      }}
    >
      <div className="p-4 pb-[72px]">
        {loading ? (
          <div className="w-full h-full flex justify-center items-center">
            <Spin />
          </div>
        ) : isEmpty ? (
          <div className="w-full h-full flex items-center justify-center">
            <Empty
              image={<IllustrationNoContent className="w-[140px] h-[140px]" />}
              title={I18n.t('card_builder_varpanel_var_empty')}
            />
          </div>
        ) : (
          <>
            {isShowBanner ? (
              <div className="h-[36px] flex items-center justify-center coz-mg-hglt coz-fg-primary text-sm mb-4 mt-[-16px] mx-[-16px]">
                <div className="flex items-center ml-auto">
                  {I18n.t('variable_config_change_banner')}
                </div>
                <div className="flex items-center ml-auto cursor-pointer">
                  <div
                    className="coz-fg-secondary text-xs"
                    onClick={hideBannerForever}
                  >
                    {I18n.t('do_not_remind_again')}
                  </div>
                  <IconButton
                    className="ml-2 !bg-transparent"
                    onClick={hideBanner}
                    icon={<IconCozCross />}
                  />
                </div>
              </div>
            ) : null}
            <Form<typeof initValues>
              getFormApi={formApi => {
                formApiRef.current = formApi;
              }}
              showValidateIcon={false}
              autoScrollToError
              initValues={initValues}
            >
              <div className="flex flex-col gap-2">
                {variableGroups.map(item => (
                  <VariableGroupComponent
                    readonly={!canEdit || item.isReadOnly}
                    groupInfo={item}
                    onVariableChange={onVariableChange}
                    validateExistKeyword={item.channel === VariableChannel.APP}
                  />
                ))}
              </div>
            </Form>
            <div
              className={cls(
                'flex items-center justify-end',
                'fixed bottom-[1px] right-[1px] left-[1px] pb-4 pt-6',
                'bg-white mr-4 px-4',
              )}
            >
              <Button
                onClick={handleSubmit}
                disabled={!canEdit || !hasUnsavedChanges}
              >
                {I18n.t('edit_variables_modal_ok_text')}
              </Button>
            </div>
          </>
        )}
      </div>
    </VariableContext.Provider>
  );
};
