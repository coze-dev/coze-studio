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
 
import { useMemo } from 'react';

import { useMount } from 'ahooks';
import { type WorkflowPlaygroundProps } from '@coze-workflow/playground';
import { OperateType } from '@coze-workflow/base/api';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';

/** 流程详情页参数 */
interface SearchParams {
  workflow_id: string;
  space_id: string;
  /** 流程版本, 当多人协作时有版本概念, 单独设置时可预览对应版本流程 */
  version?: string;
  /** 是否要恢复到目标版本, 如果设置, 则流程草稿会自动设置到对应 version */
  set_version?: string;
  /** 对应 version 的操作类型 */
  opt_type?: string;
  /** 流程页面打开来源 */
  from?: WorkflowPlaygroundProps['from'];
  /** 节点id 配置会自动定位到对应节点 */
  node_id?: string;
  /** 执行id 配置会展示对应执行结果 */
  execute_id?: string;
  /** 子流程执行id */
  sub_execute_id?: string;
}

export function usePageParams() {
  const searchParams = useMemo(() => {
    const target: SearchParams = {
      workflow_id: '',
      space_id: '',
    };
    const params = new URLSearchParams(window.location.search);
    params.forEach((value, key) => {
      target[key] = value;
    });

    return target;
  }, []);

  const {
    space_id: spaceId,
    workflow_id: workflowId,
    version,
    set_version: setVersion,
    opt_type,
    from,
    node_id: nodeId,
    execute_id: executeId,
    sub_execute_id: subExecuteId,
  } = searchParams;

  const optType = opt_type
    ? (Number(opt_type) as OperateType)
    : OperateType.SubmitOperate;

  useMount(() => {
    const newSearchParams = new URLSearchParams(window.location.search);
    let needUpdateSearch = false;
    if (from === 'createSuccess') {
      Toast.success(I18n.t('Create_success'));
      newSearchParams.delete('from');
      needUpdateSearch = true;
    } else if (from === 'dupSuccess') {
      Toast.success(I18n.t('Duplicate_success'));
      newSearchParams.delete('from');
      needUpdateSearch = true;
    }

    // 强制设置历史版本
    if (setVersion) {
      newSearchParams.delete('set_version');
      newSearchParams.delete('version');
      newSearchParams.delete('opt_type');
      needUpdateSearch = true;
    }

    if (needUpdateSearch) {
      history.replaceState(
        {},
        '',
        `${location.origin + location.pathname}?${newSearchParams.toString()}`,
      );
    }
  });

  return {
    spaceId,
    workflowId,
    version,
    setVersion: Boolean(searchParams.set_version),
    optType,
    from,
    nodeId,
    executeId,
    subExecuteId,
  };
}
