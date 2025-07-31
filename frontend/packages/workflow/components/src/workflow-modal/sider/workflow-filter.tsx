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

/* eslint-disable @coze-arch/max-line-per-function */
import {
  forwardRef,
  type ReactNode,
  useContext,
  useImperativeHandle,
  useMemo,
} from 'react';

import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { WorkflowMode } from '@coze-workflow/base/api';
import { workflowApi, isGeneralWorkflow } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozAllFill,
  IconCozFireFill,
  IconCozKnowledgeFill,
} from '@coze-arch/coze-design/icons';
import { useFlags } from '@coze-arch/bot-flags';
import { ProductEntityType } from '@coze-arch/bot-api/product_api';
import { ProductApi } from '@coze-arch/bot-api';

import WorkflowModalContext from '../workflow-modal-context';
import {
  DataSourceType,
  WorkflowCategory,
  WorkflowModalFrom,
  type WorkFlowModalModeProps,
} from '../type';

import s from './workflow-filter.module.less';

interface PluginTag {
  type?: string | number;
  name?: string;
  icon?: string | React.ReactElement;
  active_icon?: string | React.ReactElement;
}

export interface WorkflowFilterRef {
  getCurrent: () => PluginTag | undefined;
}

const WorkflowFilter = forwardRef<
  WorkflowFilterRef,
  Pick<
    WorkFlowModalModeProps,
    | 'from'
    | 'hiddenSpaceList'
    | 'hiddenExplore'
    | 'hiddenLibrary'
    | 'hiddenWorkflowCategories'
  >
>(
  (
    {
      from,
      hiddenSpaceList,
      hiddenExplore,
      hiddenLibrary,
      hiddenWorkflowCategories = [],
    },
    ref,
  ) => {
    const context = useContext(WorkflowModalContext);
    const [FLAGS] = useFlags();

    const getWorkflowTags = async (): Promise<{
      type: 'WorkFlowTemplateTag' | 'PublicGetProductCategoryList';
      data: PluginTag[];
    }> => {
      if (hiddenExplore) {
        return {
          type: 'WorkFlowTemplateTag',
          data: [],
        };
      }

      if (
        FLAGS['bot.community.store_imageflow'] ||
        isGeneralWorkflow(context?.flowMode || WorkflowMode.Workflow)
      ) {
        if (IS_OPEN_SOURCE) {
          return {
            type: 'PublicGetProductCategoryList',
            data: [],
          };
        }

        const resp = await ProductApi.PublicGetProductCategoryList({
          // Template classification, for workflow/image circulation
          entity_type: ProductEntityType.TemplateCommon,
          need_empty_category: false,
        });

        const targetList: PluginTag[] = (resp.data?.categories ?? []).map(
          item => ({
            type: item.id,
            name: item.name ?? '',
            icon: item.icon_url,
            active_icon: item.active_icon_url,
          }),
        );

        targetList.unshift({
          type: 'recommend',
          name: I18n.t('workflowstore_category1'),
          icon: <IconCozFireFill />,
          active_icon: <IconCozFireFill />,
        });

        targetList.unshift({
          type: 'all',
          name: I18n.t('All'),
          icon: <IconCozAllFill />,
          active_icon: <IconCozAllFill />,
        });

        return {
          type: 'PublicGetProductCategoryList',
          data: targetList,
        };
      }

      const res = await workflowApi.WorkFlowTemplateTag({
        flow_mode: context?.flowMode,
      });
      return {
        type: 'WorkFlowTemplateTag',
        data: res.data?.tags ?? [],
      };
    };

    const currentValue = useMemo(() => {
      if (!context?.modalState) {
        return '';
      }
      return context.modalState.dataSourceType === DataSourceType.Product
        ? context.modalState.productCategory
        : context.modalState.workflowTag;
    }, [context?.modalState]);

    const queryKey = useMemo(() => {
      const result = ['workflow-modal-side'];
      result.push(`flowMode-${context?.flowMode}`);
      return result;
    }, [context]);

    const { data: tags } = useQuery({
      enabled: Boolean(context),
      queryKey,
      queryFn: getWorkflowTags,
    });

    useImperativeHandle(ref, () => ({
      getCurrent: () => tags?.data.find(item => item.type === currentValue),
    }));
    /** Showcase space flow, my/team's */
    const clickSpaceContent = (category?: WorkflowCategory) => {
      context?.updateModalState({
        isSpaceWorkflow: category !== WorkflowCategory.Example,
        workflowCategory: category,
        workflowTag: 0,
        query: '',
        dataSourceType: DataSourceType.Workflow,
        productCategory: category,
        sortType: undefined,
      });
    };
    const nodeDataList = useMemo<
      Array<{
        title?: string;
        icon?: ReactNode;
        testId?: string;
        category?: WorkflowCategory;
      }>
    >(() => {
      const tempList = hiddenLibrary
        ? []
        : [
            {
              title: I18n.t('project_resource_modal_library_resources', {
                resource: I18n.t('library_resource_type_workflow'),
              }),
              icon: (
                <IconCozKnowledgeFill
                  className={s['tool-tag-list-cell-icon']}
                />
              ),
              testId: 'workflow.modal.search.option.library',
              category: WorkflowCategory.Library,
            },
          ];
      if (from === WorkflowModalFrom.ProjectWorkflowAddNode) {
        tempList.push({
          title: I18n.t('project_resource_modal_project_resources', {
            resource: I18n.t('library_resource_type_workflow'),
          }),
          icon: (
            <IconCozKnowledgeFill className={s['tool-tag-list-cell-icon']} />
          ),
          testId: 'workflow.modal.search.option.project',
          category: WorkflowCategory.Project,
        });
      }
      tempList.push({
        title: I18n.t('workflow_add_example'),
        icon: <IconCozKnowledgeFill className={s['tool-tag-list-cell-icon']} />,
        testId: 'workflow.modal.search.option.example',
        category: WorkflowCategory.Example,
      });
      return tempList.filter(
        item => !hiddenWorkflowCategories.includes(item.category),
      );
    }, [from, hiddenLibrary, hiddenWorkflowCategories, FLAGS]);

    if (!context) {
      return null;
    }

    return (
      <div className={`tool-tag-list ${s['tool-tag-list']}`}>
        {!hiddenSpaceList && (
          <div>
            {nodeDataList.map(nodeData => {
              const active =
                context?.modalState.workflowCategory === nodeData.category;
              return (
                <div
                  key={nodeData.testId}
                  data-testid={nodeData.testId}
                  className={classNames(s['tool-tag-list-cell'], {
                    [s.active]: active,
                  })}
                  onClick={() => clickSpaceContent(nodeData.category)}
                >
                  {nodeData.icon}
                  {nodeData.title}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  },
);

WorkflowFilter.displayName = 'WorkflowFilter';

export { WorkflowFilter };
