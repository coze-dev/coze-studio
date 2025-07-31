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

import React, { type ReactNode, useMemo } from 'react';

import {
  BizResourceContextMenuBtnType,
  BizResourceTypeEnum,
  type ResourceFolderCozeProps,
} from '@coze-project-ide/biz-components';
import { validateNameConflict } from '@coze-project-ide/biz-components';
import { I18n } from '@coze-arch/i18n';
import { ResType } from '@coze-arch/bot-api/plugin_develop';
import {
  IconCozDatabase,
  IconCozKnowledge,
} from '@coze-arch/coze-design/icons';

import useKnowledgeResource from './use-knowledge-resource';
import useImportData from './use-import-data';
import useDatabaseResource from './use-database-resource';

type UseDataResourceReturn = Pick<
  ResourceFolderCozeProps,
  | 'onCustomCreate'
  | 'onDelete'
  | 'onChangeName'
  | 'onAction'
  | 'createResourceConfig'
  | 'iconRender'
  | 'validateConfig'
> & { modals: ReactNode };

const useDataResource = (): UseDataResourceReturn => {
  const createResourceConfig = useMemo(
    () => [
      {
        icon: <IconCozKnowledge />,
        label: I18n.t('project_resource_sidebar_create_new_resource', {
          resource: I18n.t('performance_knowledge'),
        }),
        subType: BizResourceTypeEnum.Knowledge,
        tooltip: null,
      },
      {
        icon: <IconCozDatabase />,
        label: I18n.t('project_resource_sidebar_create_new_resource', {
          resource: I18n.t('review_bot_database'),
        }),
        subType: BizResourceTypeEnum.Database,
        tooltip: null,
      },
    ],
    [],
  );

  const { modal, open } = useImportData();

  const knowledgeResource = useKnowledgeResource();
  const databaseResource = useDatabaseResource();

  return {
    onCustomCreate(groupType, subType) {
      if (subType === BizResourceTypeEnum.Knowledge) {
        knowledgeResource.onCustomCreate?.(groupType, subType);
      }
      if (subType === BizResourceTypeEnum.Database) {
        databaseResource.onCustomCreate?.(groupType, subType);
      }
    },
    onChangeName(event) {
      if (event.resource?.res_type === ResType.Knowledge) {
        knowledgeResource.onChangeName?.(event);
      }
      if (event.resource?.res_type === ResType.Database) {
        databaseResource.onChangeName?.(event);
      }
    },
    onAction(action, resource) {
      if (action === BizResourceContextMenuBtnType.ImportLibraryResource) {
        open();
      } else {
        if (resource?.res_type === ResType.Knowledge) {
          knowledgeResource.onAction?.(action, resource);
        }
        if (resource?.res_type === ResType.Database) {
          databaseResource.onAction?.(action, resource);
        }
      }
    },
    onDelete(resources) {
      const deleteKnowledgeResource = resources.filter(
        resource => resource?.res_type === ResType.Knowledge,
      );
      const deleteDatabaseResource = resources.filter(
        resource => resource?.res_type === ResType.Database,
      );

      if (deleteKnowledgeResource.length) {
        knowledgeResource.onDelete?.(deleteKnowledgeResource);
      }

      if (deleteDatabaseResource.length) {
        databaseResource.onDelete?.(deleteDatabaseResource);
      }
    },
    createResourceConfig,
    modals: [knowledgeResource.modals, databaseResource.modals, modal],
    validateConfig: {
      customValidator: params => {
        if (!params.label) {
          return I18n.t('dataset-name-empty-tooltip');
        }

        if (!/^[^"'`\\]+$/.test(params.label)) {
          return I18n.t('dataset-name-has-wrong-word-tooltip');
        }

        return validateNameConflict(params);
      },
    },
  };
};

export default useDataResource;
