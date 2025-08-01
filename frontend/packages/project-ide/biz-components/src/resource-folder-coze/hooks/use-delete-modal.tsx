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

import React, { type ReactNode, useMemo, useState } from 'react';

import classnames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Modal } from '@coze-arch/coze-design';
import {
  getURIByResource,
  type ResourceFolderProps,
  type ResourceType,
  type URI,
  useProjectIDEServices,
} from '@coze-project-ide/framework';

import { VARIABLE_RESOURCE_ID } from '@/resource-folder-coze/constants';

import { getResourceIconByResource } from '../utils';
import styles from '../styles.module.less';

export const useDeleteModal = ({
  onDelete,
}: {
  onDelete?: (resources: ResourceType[]) => Promise<void> | void;
}): {
  node: ReactNode;
  handleDeleteResource: ResourceFolderProps['onDelete'];
} => {
  const projectIDEServices = useProjectIDEServices();
  const [resources, setResources] = useState<ResourceType[]>([]);
  const [visible, setVisible] = useState(false);
  const open = () => setVisible(true);
  const close = () => {
    setResources([]);
    setVisible(false);
  };
  const content = useMemo(() => {
    if (!resources.length) {
      return <></>;
    }
    let contentText = '';
    if (resources.length > 1) {
      contentText = I18n.t('project_resource_sidebar_confirm_batch_delete', {
        count: resources.length,
      });
    } else {
      contentText = I18n.t('project_resource_sidebar_confirm_delete', {
        resourceName: resources[0].name,
      });
    }
    return (
      <div className="break-all">
        <span className="coz-fg-secondary">{contentText}</span>
        {resources.length > 1 ? (
          <div className={styles['file-list-wrapper']}>
            <div className={styles['file-list']}>
              {resources.map(r => (
                <span className={styles['file-item']}>
                  <span className={classnames(styles['file-icon'])}>
                    {getResourceIconByResource(r)}
                  </span>
                  <span className={styles['file-name']}>{r.name}</span>
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    );
  }, [resources]);
  const modal = (
    <Modal
      type="dialog"
      okButtonColor="red"
      title={
        <span className="text-[16px] font-medium coz-fg-plus">
          {I18n.t('project_resource_sidebar_delete')}
        </span>
      }
      visible={visible}
      okText={I18n.t('Delete')}
      cancelText={I18n.t('Cancel')}
      autoLoading={true}
      onOk={async () => {
        await onDelete?.(resources);
        resources
          .map(resource =>
            resource.type ? getURIByResource(resource.type, resource.id) : null,
          )
          .filter((uri): uri is URI => Boolean(uri))
          .forEach(uri => projectIDEServices.view.closeWidgetByUri(uri));
        close();
      }}
      onCancel={() => close()}
    >
      {content}
    </Modal>
  );
  const handleDeleteResource = (res: ResourceType[]) => {
    console.log('[ResourceFolder]on delete resource>>>', res);
    const resourceToDelete = res.filter(r => r.id !== VARIABLE_RESOURCE_ID);
    if (!resourceToDelete.length) {
      return;
    }
    setResources(resourceToDelete);
    open();
  };
  return { node: modal, handleDeleteResource };
};
