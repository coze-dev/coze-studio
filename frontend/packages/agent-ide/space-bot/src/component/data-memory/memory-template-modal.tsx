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

import { type ComponentProps } from 'react';

import { type VariableItem } from '@coze-studio/bot-detail-store';
import { UIModal, Image, type Modal } from '@coze-arch/bot-semi';
import { Button, Popconfirm } from '@coze-arch/bot-semi';
import { I18n } from '@coze-arch/i18n';
import { IconAlertCircle } from '@douyinfe/semi-icons';

import { BotDebugButton } from '../bot-debug-button';
import IMG_TEMPLATE_USE_I18N from '../../assets/image/template_i18n.png';
import templateSample from '../../assets/image/sample3_i18n.png';

import s from './index.module.less';

export type MemoryTemplateModalProps = ComponentProps<typeof Modal> & {
  addTemplate?: (arr: VariableItem[]) => void;
  needSecondConfirm?: boolean;
  showType?: 'variableList';
};

const list: VariableItem[] = [
  {
    key: 'Name',
    description: I18n.t('profile_memory_sample_description_name'),
  },
  {
    key: 'Address',
    description: I18n.t('profile_memory_sample_description_address'),
  },
  {
    key: 'PhoneNumber',
    description: I18n.t('profile_memory_sample_description_mobile'),
  },
  {
    key: 'Height',
    description: I18n.t('profile_memory_sample_description_height'),
  },
  {
    key: 'Weight',
    description: I18n.t('profile_memory_sample_description_weight'),
  },
];

export const MemoryTemplateModal: React.FC<
  MemoryTemplateModalProps
> = props => (
  <UIModal
    {...props}
    type="action"
    centered
    footer={
      props.showType === 'variableList' ? (
        <div className={s['template-footer']}>
          <Button
            theme="solid"
            className={s['template-cancel-button']}
            onClick={props.onCancel}
          >
            {I18n.t('cancel_template')}
          </Button>
          {props.needSecondConfirm ? (
            <Popconfirm
              className={s['use-template-pop-confirm']}
              position="top"
              icon={
                <IconAlertCircle
                  size="extra-large"
                  style={{ color: '#ff9600' }}
                />
              }
              title={I18n.t('use_template_confirm_title')}
              content={I18n.t('use_template_confirm_info')}
              okText={I18n.t('use_template_confirm_ok_text')}
              cancelText={I18n.t('use_template_confirm_ cancel_text')}
              okButtonProps={{ type: 'warning' }}
              onConfirm={() => props.addTemplate?.(list)}
            >
              <BotDebugButton
                theme="solid"
                type="primary"
                style={{ padding: '8px 12px' }}
              >
                {I18n.t('Use_template')}
              </BotDebugButton>
            </Popconfirm>
          ) : (
            <BotDebugButton
              theme="solid"
              type="primary"
              style={{ padding: '8px 12px' }}
              onClick={() => props.addTemplate?.(list)}
            >
              {I18n.t('Use_template')}
            </BotDebugButton>
          )}
        </div>
      ) : null
    }
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    width={props.showType === 'variableList' ? 562 : 448}
    title={I18n.t('variable_template_title')}
    className={props.className}
  >
    <div className={s['modal-container']}>
      {props.showType === 'variableList' ? (
        <Image
          className={s['template-variable-list']}
          src={IMG_TEMPLATE_USE_I18N}
          preview={false}
        />
      ) : (
        <div className={s['template-demo']}>
          <div className={s.desc}>{I18n.t('variable_template_demo_desc')}</div>
          <div className={s.image}>
            <Image
              className={s['image-template']}
              src={templateSample}
              preview={false}
            />
          </div>
          <div className={s.tip}>{I18n.t('variable_template_demo_text')}</div>
        </div>
      )}
    </div>
  </UIModal>
);
