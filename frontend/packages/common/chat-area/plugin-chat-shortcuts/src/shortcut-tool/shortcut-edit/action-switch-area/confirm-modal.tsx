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

import { type FC, useRef, useState } from 'react';

import { type ShortCutCommand } from '@coze-agent-ide/tool-config';
import { Deferred } from '@coze-common/chat-area-utils';
import { I18n } from '@coze-arch/i18n';
import { Button } from '@coze-arch/coze-design';
import { UIModal } from '@coze-arch/bot-semi';

export interface HasUnusedComponentsConfirmModalProps {
  onConfirm?: () => void;
  onCancel?: () => void;
  components: ShortCutCommand['components_list'];
}
export const HasUnusedComponentsConfirmModal: FC<
  HasUnusedComponentsConfirmModalProps
> = ({ onConfirm, components, onCancel }) => {
  const unUsedComponentsNames = components
    ?.map(component => component.name)
    .join(', ');
  return (
    <UIModal
      visible
      footer={null}
      onCancel={onCancel}
      bodyStyle={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        padding: '0 0 16px 0',
      }}
      title={I18n.t(
        'shortcut_modal_save_shortcut_with_components_unused_modal_title',
      )}
    >
      <div className="pb-6">
        {I18n.t(
          'shortcut_modal_save_shortcut_with_components_unused_modal_desc',
          {
            unUsedComponentsNames,
          },
        )}
      </div>
      <div className="flex gap-2 justify-end">
        <Button
          onClick={onCancel}
          color="highlight"
          className="!coz-mg-hglt !coz-fg-hglt"
        >
          {I18n.t('Cancel')}
        </Button>
        <Button onClick={onConfirm}>{I18n.t('Confirm')}</Button>
      </div>
    </UIModal>
  );
};

export const useHasUnusedComponentsConfirmModal = () => {
  const [visible, setVisible] = useState(false);
  const [components, setComponents] = useState<
    ShortCutCommand['components_list']
  >([]);

  const openDeferred = useRef<Deferred<boolean> | null>(null);

  const close = () => {
    openDeferred.current?.resolve(false);
    setVisible(false);
  };

  const onConfirm = () => {
    openDeferred.current?.resolve(true);
    setVisible(false);
  };

  const open = (unUsedComponents: ShortCutCommand['components_list']) => {
    openDeferred.current = new Deferred<boolean>();
    setComponents(unUsedComponents);
    setVisible(true);
    return openDeferred.current.promise;
  };

  return {
    node: visible ? (
      <HasUnusedComponentsConfirmModal
        components={components}
        onCancel={close}
        onConfirm={onConfirm}
      />
    ) : null,
    close,
    open,
  };
};
