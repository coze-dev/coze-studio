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

import { useContext, type ReactNode } from 'react';

import { WorkflowMode } from '@coze-workflow/base/api';
import { I18n } from '@coze-arch/i18n';

import WorkflowModalContext from '../workflow-modal-context';

export enum ModalI18nKey {
  Title = 'title',
  NavigationMy = 'navigation_my',
  NavigationTeam = 'navigation_team',
  NavigationExplore = 'navigation_explore',
  TabAll = 'tab_all',
  TabMine = 'tab_mine',
  ListEmptyTitle = 'list_empty_title',
  CreatedListEmptyTitle = 'created_list_empty_title',
  CreatedListEmptyDescription = 'created_list_empty_description',
  NavigationCreate = 'navigation_create',
  ListError = 'list_error',
  ListItemRemove = 'list_item_remove',
  ListItemRemoveConfirmTitle = 'list_item_remove_confirm_title',
  ListItemRemoveConfirmDescription = 'list_item_remove_confirm_description',
}

/**
 * Use this structure when the i18n text has variables
 */
interface I18nKeyWithOptions {
  /* I18n copy key */
  key: string;
  /* variable parameter object */
  options?: Record<string, ReactNode>;
}
export type I18nKey = string | I18nKeyWithOptions;

// The key to each i18n copy used to store workflow and imageflow
export const WORKFLOW_MODAL_I18N_KEY_MAP: {
  [WorkflowMode.Workflow]: Record<ModalI18nKey, I18nKey>;
  [WorkflowMode.Imageflow]: Record<ModalI18nKey, I18nKey>;
  [WorkflowMode.SceneFlow]: Record<ModalI18nKey, I18nKey>;
} = {
  [WorkflowMode.Workflow]: {
    [ModalI18nKey.Title]: 'workflow_add_title',
    [ModalI18nKey.NavigationMy]: 'workflow_add_navigation_my',
    [ModalI18nKey.NavigationTeam]: 'workflow_add_navigation_team',
    [ModalI18nKey.NavigationExplore]: 'workflow_add_navigation_explore',
    [ModalI18nKey.TabAll]: 'workflow_add_created_tab_all',
    [ModalI18nKey.TabMine]: 'workflow_add_created_tab_mine',
    [ModalI18nKey.ListEmptyTitle]: 'workflow_add_list_empty_title',
    [ModalI18nKey.CreatedListEmptyTitle]:
      'workflow_add_created_list_empty_title',
    [ModalI18nKey.CreatedListEmptyDescription]:
      'workflow_add_created_list_empty_description',
    [ModalI18nKey.NavigationCreate]: 'workflow_add_create_library',
    [ModalI18nKey.ListError]: 'workflow_add_list_added_id_empty',
    [ModalI18nKey.ListItemRemove]: 'workflow_add_list_remove',
    [ModalI18nKey.ListItemRemoveConfirmTitle]:
      'workflow_add_remove_confirm_title',
    [ModalI18nKey.ListItemRemoveConfirmDescription]:
      'workflow_add_remove_confirm_content',
  },
  [WorkflowMode.Imageflow]: {
    [ModalI18nKey.Title]: 'imageflow_add',
    [ModalI18nKey.NavigationMy]: 'workflow_add_navigation_my',
    [ModalI18nKey.NavigationTeam]: 'imageflow_workspace2',
    [ModalI18nKey.NavigationExplore]: 'imageflow_explore',
    [ModalI18nKey.TabAll]: 'workflow_add_created_tab_all',
    [ModalI18nKey.TabMine]: 'workflow_add_created_tab_mine',
    [ModalI18nKey.ListEmptyTitle]: 'imageflow_detail_no_search_result',
    [ModalI18nKey.CreatedListEmptyTitle]: 'imageflow_title',
    [ModalI18nKey.CreatedListEmptyDescription]: 'imageflow_title_description',
    [ModalI18nKey.NavigationCreate]: 'imageflow_create',
    [ModalI18nKey.ListError]: 'imageflow_add_toast_error',
    [ModalI18nKey.ListItemRemove]: 'workflow_add_list_remove',
    [ModalI18nKey.ListItemRemoveConfirmTitle]:
      'workflow_add_remove_confirm_title',
    [ModalI18nKey.ListItemRemoveConfirmDescription]:
      'workflow_add_remove_confirm_content',
  },
  [WorkflowMode.SceneFlow]: {
    [ModalI18nKey.Title]: 'scene_workflow_popup_title',
    [ModalI18nKey.NavigationMy]: 'workflow_add_navigation_my',
    [ModalI18nKey.NavigationTeam]: 'workflow_add_navigation_team',
    [ModalI18nKey.NavigationExplore]: 'workflow_add_navigation_explore',
    [ModalI18nKey.TabAll]: 'workflow_add_created_tab_all',
    [ModalI18nKey.TabMine]: 'workflow_add_created_tab_mine',
    [ModalI18nKey.ListEmptyTitle]: 'scene_workflow_popup_search_empty',
    [ModalI18nKey.CreatedListEmptyTitle]: 'scene_workflow_popup_list_empty',
    // Scenario workflow not described
    [ModalI18nKey.CreatedListEmptyDescription]: '',
    [ModalI18nKey.NavigationCreate]: 'workflow_add_navigation_create',
    [ModalI18nKey.ListError]: 'workflow_add_list_added_id_empty',
    [ModalI18nKey.ListItemRemove]: {
      key: 'scene_workflow_delete_workflow_button',
      options: { source: I18n.t('scene_mkpl_search_title') },
    },
    [ModalI18nKey.ListItemRemoveConfirmTitle]: {
      key: 'scene_workflow_delete_workflow_popup_title',
      options: { source: I18n.t('scene_mkpl_search_title') },
    },
    [ModalI18nKey.ListItemRemoveConfirmDescription]: {
      key: 'scene_workflow_delete_workflow_popup_subtitle',
      options: { source: I18n.t('scene_mkpl_search_title') },
    },
  },
};

/**
 * Automatically returns the corresponding internationalization copy according to flowMode
 */
export function useI18nText() {
  const context = useContext(WorkflowModalContext);
  const flowMode = context?.flowMode ?? WorkflowMode.Workflow;

  const i18nText = (key: ModalI18nKey) => {
    const i18nKey =
      context?.i18nMap?.[key] ||
      WORKFLOW_MODAL_I18N_KEY_MAP[flowMode]?.[key] ||
      WORKFLOW_MODAL_I18N_KEY_MAP[WorkflowMode.Workflow]?.[key];
    const finalKey = typeof i18nKey === 'string' ? i18nKey : i18nKey.key;
    return I18n.t(finalKey || '', i18nKey?.options);
  };

  return { i18nText, ModalI18nKey };
}
