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

/* eslint-disable complexity */
import isNil from 'lodash-es/isNil';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozInfoCircle,
  IconCozCheckMarkCircleFillPalette,
} from '@coze-arch/coze-design/icons';
import { Typography, Tag, Tooltip, IconButton } from '@coze-arch/coze-design';

import { WorkflowReferencesTip } from '../workflow-references/references-tip';
import { ExecuteState } from '../test-run/execute-result/execute-result-side-sheet/components/execute-state';
import { useGlobalState } from '../../hooks';
import { PublishStatus, EditModal } from './components';

import css from './index.module.less';

const { Text } = Typography;

export const WorkflowInfo = () => {
  const globalState = useGlobalState();
  const {
    info,
    config,
    readonly,
    isCollaboratorMode,
    hasChanged,
    isViewHistory,
  } = globalState;

  const { autoSaveTime, savingError, preview } = config;

  // Has the current process been published?
  const isPublished = info.plugin_id !== '0';

  return (
    <div className={css['workflow-info']}>
      <div className={css['workflow-title']}>
        <Text
          style={{ maxWidth: 300 }}
          strong
          ellipsis={{
            showTooltip: {
              opts: {
                content: info?.name || '-',
                style: { wordBreak: 'break-word' },
              },
            },
          }}
        >
          {info?.name || '-'}
        </Text>

        <Tooltip
          content={info?.desc || '-'}
          style={{ wordBreak: 'break-word', maxWidth: '300px' }}
        >
          <IconButton
            icon={<IconCozInfoCircle />}
            color="secondary"
            size="mini"
          />
        </Tooltip>

        {isPublished && !isViewHistory ? (
          <Tooltip content={I18n.t('workflow_detail_title_published')}>
            <IconButton
              icon={
                <IconCozCheckMarkCircleFillPalette className="coz-fg-hglt-green" />
              }
              color="secondary"
              size="mini"
            />
          </Tooltip>
        ) : null}

        {!readonly && <EditModal />}
      </div>

      <div className={css['workflow-status']}>
        {(isNil(info) || !preview) && isCollaboratorMode ? (
          <PublishStatus />
        ) : null}

        {/* Auto save time tag */}
        {!readonly && !isCollaboratorMode && (
          <Tag size="mini" color="primary">
            {I18n.t('workflow_detail_title_saved_2', {
              time: autoSaveTime,
            })}
          </Tag>
        )}
        {/* Save error tag */}
        {!readonly && !!savingError && (
          <Tag size="mini" color="red">
            {I18n.t('workflow_detail_node_save_error')}
          </Tag>
        )}

        {/* Preview tag */}
        {!isNil(info) && preview ? (
          <Tag size="mini" color="blue">
            {I18n.t('workflow_detail_title_previewing')}
          </Tag>
        ) : null}

        {!readonly && <WorkflowReferencesTip />}

        {/* Prompt for modified but unpublished tags */}
        {hasChanged && !readonly ? (
          <Tag size="mini" color="primary">
            {I18n.t('workflow_unpublish_change')}
          </Tag>
        ) : null}

        <ExecuteState />
      </div>
    </div>
  );
};
