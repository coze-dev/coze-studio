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
 
/* eslint-disable max-lines-per-function */
/* eslint-disable @coze-arch/max-line-per-function */

import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react';

import { omit } from 'lodash-es';
import {
  useInfiniteQuery,
  type UseInfiniteQueryResult,
} from '@tanstack/react-query';
import {
  WorkflowMode,
  type GetWorkFlowListRequest,
  type GetExampleWorkFlowListRequest,
  type GetWorkFlowListResponse,
  type GetExampleWorkFlowListResponse,
  WorkFlowType,
  DeleteType,
  workflowApi,
  DeleteAction,
  type WorkflowListByBindBizRequest,
  SchemaType,
  BindBizType,
  CheckType,
} from '@coze-workflow/base/api';
import { I18n } from '@coze-arch/i18n';
import { CustomError } from '@coze-arch/bot-error';
import { Toast } from '@coze-arch/coze-design';

import { reporter, wait } from '../utils';
import { type WorkflowInfo, WorkflowModalFrom } from '../types';

interface FetchWorkflowListResult {
  total: number;
  workflow_list: WorkflowInfo[];
}

interface WorkflowListReturn {
  flowType: WorkFlowType;
  setFlowType: Dispatch<SetStateAction<WorkFlowType>>;
  flowMode: WorkflowMode;
  setFlowMode: Dispatch<SetStateAction<WorkflowMode>>;
  spaceId: string;
  setSpaceId: Dispatch<SetStateAction<string>>;
  status: GetWorkFlowListRequest['status'] | undefined;
  setStatus: Dispatch<
    SetStateAction<GetWorkFlowListRequest['status'] | undefined>
  >;
  name: GetWorkFlowListRequest['name'] | undefined;
  setName: Dispatch<SetStateAction<GetWorkFlowListRequest['name'] | undefined>>;
  tags: GetWorkFlowListRequest['tags'] | undefined;
  setTags: Dispatch<SetStateAction<GetWorkFlowListRequest['tags'] | undefined>>;
  orderBy: GetWorkFlowListRequest['order_by'] | undefined;
  setOrderBy: Dispatch<
    SetStateAction<GetWorkFlowListRequest['order_by'] | undefined>
  >;
  loginUserCreate: boolean | undefined;
  setLoginUserCreate: Dispatch<SetStateAction<boolean | undefined>>;
  updatePageParam: (
    newParam: Partial<GetWorkFlowListRequest & WorkflowListByBindBizRequest>,
  ) => void;
  workflowList: WorkflowInfo[];
  total: number;
  queryError: UseInfiniteQueryResult['error'];
  fetchNextPage: UseInfiniteQueryResult['fetchNextPage'];
  hasNextPage: UseInfiniteQueryResult['hasNextPage'];
  isFetching: UseInfiniteQueryResult['isFetching'];
  isFetchingNextPage: UseInfiniteQueryResult['isFetchingNextPage'];
  loadingStatus: UseInfiniteQueryResult['status'];
  refetch: UseInfiniteQueryResult['refetch'];
  handleCopy: (item: WorkflowInfo) => Promise<void>;
  handleDelete: (item: WorkflowInfo) => Promise<{
    canDelete: boolean;
    deleteType: DeleteType;
    handleDelete:
      | ((params?: { needDeleteBlockwise: boolean }) => Promise<void>)
      | undefined;
  }>;
}

const defaultPageSize = 20;

/**
 * 流程列表
 */
export function useWorkflowList({
  pageSize = defaultPageSize,
  enabled = false,
  from,
  fetchWorkflowListApi = workflowApi.GetWorkFlowList.bind(workflowApi),
}: {
  pageSize?: number;
  /** 是否开启数据获取 */
  enabled?: boolean;
  from?: WorkflowModalFrom;
  fetchWorkflowListApi?: (
    params: GetWorkFlowListRequest | GetExampleWorkFlowListRequest,
  ) => Promise<GetWorkFlowListResponse | GetExampleWorkFlowListResponse>;
} = {}): Readonly<WorkflowListReturn> {
  const [flowMode, setFlowMode] = useState<WorkflowMode>(WorkflowMode.All);
  const [flowType, setFlowType] = useState<WorkFlowType>(WorkFlowType.User);
  const [spaceId, setSpaceId] = useState<string>('');
  const [name, setName] = useState<GetWorkFlowListRequest['name']>();
  const [status, setStatus] = useState<GetWorkFlowListRequest['status']>();
  const [orderBy, setOrderBy] = useState<GetWorkFlowListRequest['order_by']>();
  const [tags, setTags] = useState<GetWorkFlowListRequest['tags']>();
  const [bindBizId, setBindBizId] =
    useState<WorkflowListByBindBizRequest['bind_biz_id']>();
  const [bindBizType, setBindBizType] =
    useState<WorkflowListByBindBizRequest['bind_biz_type']>();
  const [loginUserCreate, setLoginUserCreate] =
    useState<GetWorkFlowListRequest['login_user_create']>();
  const [projectId, setProjectId] =
    useState<GetWorkFlowListRequest['project_id']>('');
  const initialPageParam = useMemo<GetWorkFlowListRequest>(
    () => ({
      page: 1,
      size: pageSize,
      type: flowType,
      name,
      space_id: spaceId,
      status,
      tags,
      order_by: orderBy,
      login_user_create: loginUserCreate,
      flow_mode: flowMode,
      bind_biz_id: bindBizId,
      bind_biz_type: bindBizType,
      project_id: projectId,
    }),
    [
      flowType,
      status,
      name,
      flowMode,
      orderBy,
      spaceId,
      loginUserCreate,
      tags,
      bindBizId,
      bindBizType,
      projectId,
    ],
  );

  const updatePageParam = useCallback(
    (newParam: Partial<GetWorkFlowListRequest>) => {
      [
        { key: 'type', func: setFlowType, defaultValue: WorkFlowType.User },
        { key: 'name', func: setName },
        { key: 'space_id', func: setSpaceId, defaultValue: '' },
        { key: 'status', func: setStatus },
        { key: 'tags', func: setTags },
        { key: 'order_by', func: setOrderBy },
        { key: 'login_user_create', func: setLoginUserCreate },
        {
          key: 'flow_mode',
          func: setFlowMode,
          defaultValue: WorkflowMode.All,
        },
        { key: 'bind_biz_id', func: setBindBizId },
        { key: 'bind_biz_type', func: setBindBizType },
        { key: 'project_id', func: setProjectId },
      ]
        .filter(({ key }) => key in newParam)
        .forEach(({ key, defaultValue, func }) =>
          func?.(newParam[key] ?? defaultValue),
        );
    },
    [],
  );

  const fetchWorkflowList = async (
    params: GetWorkFlowListRequest & WorkflowListByBindBizRequest,
  ): Promise<FetchWorkflowListResult> => {
    try {
      reporter.info({
        message: 'workflow_list_get_list',
      });

      const result: FetchWorkflowListResult = {
        total: 0,
        workflow_list: [],
      };

      if (params.bind_biz_type === BindBizType.Scene && params.bind_biz_id) {
        const resp = await workflowApi.WorkflowListByBindBiz(params);
        result.total = (resp.data.total as number) ?? 0;
        // 设置流程权限
        result.workflow_list = (resp.data.workflow_list ?? []).map(
          (item): WorkflowInfo => {
            const authInfo = {
              can_edit: true,
              can_copy: true,
              can_delete: !!item?.creator?.self,
            };
            return {
              ...item,
              authInfo,
            };
          },
        );
      } else {
        // 多人协作场景，DEV 模式需要展示 Blockwise workflow（除了流程列表引用）
        Object.assign(params, {
          schema_type_list: [SchemaType.FDL],
          checker:
            from === WorkflowModalFrom.WorkflowAgent
              ? [CheckType.BotAgent]
              : undefined,
        });

        const isDouyinBot = params.bind_biz_type === BindBizType.DouYinBot;
        // 如果不是抖音分身模式，搜索参数不携带 bind_biz_id 参数
        // 否则会导致某个工作流关联到 Agent 后0，之后在该工作流添加子工作流时看不到工作流列表
        const fetchParams = isDouyinBot
          ? params
          : omit(params, ['bind_biz_id']);

        const resp = await fetchWorkflowListApi(fetchParams);
        result.total = (resp.data.total as number) ?? 0;
        // 设置流程权限
        result.workflow_list = (resp.data.workflow_list ?? []).map(
          (item): WorkflowInfo => {
            let authInfo = {
              can_edit: true,
              can_copy: true,
              can_delete: !!item?.creator?.self,
            };
            const authItem = (resp.data.auth_list ?? []).find(
              it => it.workflow_id === item.workflow_id,
            );
            if (authItem) {
              authInfo = { ...authInfo, ...authItem.auth };
            }

            return {
              ...item,
              authInfo,
            };
          },
        );
      }

      reporter.info({
        message: 'workflow_list_get_list_success',
        meta: {
          currentPage: params.page,
          pageSize: params.size,
          order_by: params.order_by,
          name: params.name,
          total: result.total,
        },
      });
      return result;
    } catch (error) {
      reporter.error({
        message: 'workflow_list_get_list_fail',
        error,
      });
      throw error;
    }
  };

  const {
    data: pageData,
    error: queryError,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status: loadingStatus,
    refetch,
  } = useInfiniteQuery({
    enabled: enabled && !!spaceId,
    queryKey: ['space_workflow_list', 'vcs', JSON.stringify(initialPageParam)],
    queryFn: ({ pageParam }) => fetchWorkflowList(pageParam),
    initialPageParam,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if ((lastPageParam.page ?? 1) * pageSize > lastPage.total) {
        return null;
      }
      return {
        ...lastPageParam,
        page: (lastPageParam.page ?? 1) + 1,
      };
    },
  });

  const workflowList = useMemo(() => {
    const result: WorkflowInfo[] = [];
    const idMap: Record<string, boolean> = {};
    pageData?.pages.forEach(page => {
      page.workflow_list.forEach(workflow => {
        if (!workflow.workflow_id) {
          return;
        }

        if (!idMap[workflow.workflow_id]) {
          result.push(workflow);
        }
        idMap[workflow.workflow_id] = true;
      });
    });
    return result;
  }, [pageData]);

  const total = useMemo(() => {
    if (
      !pageData?.pages ||
      !Array.isArray(pageData.pages) ||
      pageData.pages.length === 0
    ) {
      return 0;
    }

    return pageData.pages[pageData.pages.length - 1].total ?? 0;
  }, [pageData]);

  // 复制
  const handleCopy = async (item: WorkflowInfo) => {
    if (!item.workflow_id || !spaceId) {
      throw new CustomError('normal_error', 'miss workflowId or spaceID');
    }

    // 检查复制权限
    if (!item.authInfo.can_copy) {
      throw new CustomError('normal_error', 'no copy permission');
    }
    reporter.info({
      message: 'workflow_list_copy_row',
      meta: {
        workflowId: item.workflow_id,
      },
    });

    try {
      let isError = false;
      const { data } = await workflowApi.CopyWorkflow({
        space_id: spaceId,
        workflow_id: item.workflow_id,
      });
      isError = !data?.workflow_id;

      if (isError) {
        Toast.error(I18n.t('workflow_detail_toast_createcopy_failed'));
        reporter.error({
          message: 'workflow_list_copy_row_fail',
          error: new CustomError('normal_error', 'result no workflow'),
        });
        return;
      }

      Toast.success({
        content:
          flowMode === WorkflowMode.Imageflow
            ? I18n.t('imageflow_detail_toast_createcopy_succeed')
            : I18n.t('workflow_detail_toast_createcopy_succeed'),
        showClose: false,
      });

      reporter.info({
        message: 'workflow_list_copy_row_success',
        meta: {
          workflowId: item.workflow_id,
        },
      });

      // 兜底服务主从延迟
      await wait(300);

      // 刷新列表
      refetch();
    } catch (error) {
      reporter.error({
        message: 'workflow_list_copy_row_fail',
        error,
      });
      Toast.error(I18n.t('workflow_detail_toast_createcopy_failed'));
    }
  };

  // 删除
  const handleDelete = async (item: WorkflowInfo) => {
    if (!item.workflow_id || !spaceId) {
      throw new CustomError('normal_error', 'miss workflowId or spaceID');
    }

    // 先检查删除权限
    if (!item.authInfo.can_delete) {
      throw new CustomError('normal_error', 'no delete permission');
    }

    reporter.info({
      message: 'workflow_list_delete_row',
      meta: {
        workflowId: item.workflow_id,
      },
    });

    let deleteType = DeleteType.CanDelete;

    // 从服务端查询删除模式
    const resp = await workflowApi.GetDeleteStrategy({
      space_id: spaceId,
      workflow_id: item.workflow_id,
    });
    deleteType = resp.data;

    const canDelete = [
      DeleteType.CanDelete,
      DeleteType.RejectProductDraft,
    ].includes(deleteType);

    const deleteFuc = async (deleteParams?: {
      needDeleteBlockwise: boolean;
    }) => {
      const needDeleteBlockwise = deleteParams?.needDeleteBlockwise;
      const action = needDeleteBlockwise
        ? DeleteAction.BlockwiseDelete
        : DeleteAction.BlockwiseUnbind;

      if (!item.workflow_id || !spaceId) {
        throw new CustomError('normal_error', 'miss workflowId or spaceID');
      }
      try {
        await workflowApi.DeleteWorkflow({
          space_id: spaceId,
          workflow_id: item.workflow_id,
          action,
        });

        Toast.success({
          content: I18n.t('workflow_add_delete_success'),
          showClose: false,
        });

        reporter.info({
          message: 'workflow_list_delete_row_success',
        });

        // 兜底服务主从延迟
        await wait(300);

        // 刷新列表
        refetch();
      } catch (error) {
        reporter.error({
          message: 'workflow_list_delete_row_fail',
          error,
        });
        Toast.error({
          content: I18n.t('workflow_add_delete_fail'),
          showClose: false,
        });
      }
    };
    return {
      /** 是否可删除 */
      canDelete,
      /** 删除策略 */
      deleteType,
      /** 删除方法 */
      handleDelete: canDelete ? deleteFuc : undefined,
    };
  };

  return {
    // 列表筛选状态
    flowType,
    setFlowType,
    flowMode,
    setFlowMode,
    spaceId,
    setSpaceId,
    status,
    setStatus,
    name,
    setName,
    tags,
    setTags,
    orderBy,
    setOrderBy,
    loginUserCreate,
    setLoginUserCreate,
    /** 更新筛选参数 */
    updatePageParam,
    // 列表获取
    /** 流程列表数据 */
    workflowList,
    /** 流程总数 */
    total,
    /** 获取列表请求错误 */
    queryError,
    /** 拉取下一页数据 */
    fetchNextPage,
    /** 是否有下一页 */
    hasNextPage,
    /** 获取数据中 */
    isFetching,
    /** 获取下一页数据中 */
    isFetchingNextPage,
    /** 加载状态 */
    loadingStatus,
    /** 重新加载 */
    refetch,
    // 列表操作
    /** 复制流程 */
    handleCopy,
    // /** 删除流程 */
    handleDelete,
  } as const;
}
