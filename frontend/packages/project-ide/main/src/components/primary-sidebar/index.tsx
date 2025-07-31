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

import React, { useState, lazy, Suspense } from 'react';

import classnames from 'classnames';
import { withQueryClient } from '@coze-workflow/base';
import { useProjectIDEServices } from '@coze-project-ide/framework';
import { useResourceList } from '@coze-project-ide/biz-components';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozSideExpand,
  IconCozBinding,
} from '@coze-arch/coze-design/icons';
import { IconButton, Button } from '@coze-arch/coze-design';
import { useFlags } from '@coze-arch/bot-flags';

import { ResourceList } from '../resource-list';
import { HEADER_HEIGHT } from '../../constants/styles';

import styles from './styles.module.less';

const ResourceTreeModal = lazy(() =>
  import('../resource-tree-modal').then(exps => ({
    default: exps.ResourceTreeModal,
  })),
);

const PrimarySidebarCore = ({
  hideExpand,
  idPrefix,
}: {
  hideExpand?: boolean;
  idPrefix?: string;
}) => {
  const projectIDEServices = useProjectIDEServices();
  const { workflowResource } = useResourceList();
  const [modalVisible, setModalVisible] = useState(false);
  const [FLAGS] = useFlags();

  const handleExpand = () => {
    projectIDEServices.view.primarySidebar.changeVisible(false);
  };

  return (
    <div className={styles['primary-sidebar']}>
      <div
        className={classnames(
          styles['primary-sidebar-header'],
          `h-[${HEADER_HEIGHT}px]`,
        )}
      >
        <div className={styles.title}>
          {I18n.t('project_resource_sidebar_title')}
          {/* Support soon, so stay tuned. */}
          {FLAGS['bot.automation.dependency_tree'] ? (
            <>
              <Button
                size="small"
                icon={<IconCozBinding />}
                color="primary"
                disabled={!workflowResource?.length}
                onClick={() => setModalVisible(true)}
              >
                {I18n.t('reference_graph_entry_button')}
              </Button>
              {modalVisible ? (
                <Suspense fallback={null}>
                  <ResourceTreeModal
                    modalVisible={modalVisible}
                    setModalVisible={setModalVisible}
                  />
                </Suspense>
              ) : null}
            </>
          ) : null}
        </div>
        {hideExpand ? null : (
          <IconButton
            data-testid="project-expand-button"
            icon={<IconCozSideExpand className="coz-fg-primary" />}
            color="secondary"
            size="small"
            onClick={handleExpand}
          />
        )}
      </div>
      <div
        className={styles['resource-list-wrapper']}
        style={{ height: `calc(100% - ${HEADER_HEIGHT}px)` }}
      >
        <ResourceList idPrefix={idPrefix} />
      </div>
    </div>
  );
};
export const PrimarySidebar = withQueryClient(PrimarySidebarCore);
