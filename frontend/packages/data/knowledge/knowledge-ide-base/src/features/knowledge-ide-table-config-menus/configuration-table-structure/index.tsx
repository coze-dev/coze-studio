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

import { useDataNavigate } from '@coze-data/knowledge-stores';
import { OptType } from '@coze-data/knowledge-resource-processor-core';
import { I18n } from '@coze-arch/i18n';
import { UpdateType } from '@coze-arch/bot-api/knowledge';
import { Menu } from '@coze-arch/coze-design';

import {
  type TableConfigMenuModule,
  type TableConfigMenuModuleProps,
} from '../module';

export const ConfigurationTableStructure = (
  props: TableConfigMenuModuleProps,
) => {
  const { documentInfo } = props;
  const resourceNavigate = useDataNavigate();

  if (
    documentInfo.update_type !== undefined &&
    documentInfo.update_type !== UpdateType.NoUpdate
  ) {
    return null;
  }

  const handleClick = () => {
    resourceNavigate.upload?.({
      type: 'table',
      opt: OptType.RESEGMENT,
      doc_id: documentInfo?.document_id ?? '',
    });
  };

  return (
    <Menu.Item onClick={handleClick}>
      {I18n.t('knowledge_segment_config_table')}
    </Menu.Item>
  );
};
export const ConfigurationTableStructureModule: TableConfigMenuModule = {
  Component: ConfigurationTableStructure,
};
