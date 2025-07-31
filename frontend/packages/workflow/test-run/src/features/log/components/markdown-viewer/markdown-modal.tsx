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

import { I18n } from '@coze-arch/i18n';
import { Modal } from '@coze-arch/coze-design';

import { MarkdownBoxViewer } from './markdown-viewer';

import css from './markdown-modal.module.less';

interface MarkdownModalProps {
  visible?: boolean;
  value: string;
  onClose: () => void;
}

export const MarkdownModal: React.FC<MarkdownModalProps> = ({
  visible,
  value,
  onClose,
}) => (
  <Modal
    visible={visible}
    title={I18n.t('creat_project_use_template_preview')}
    size="large"
    getPopupContainer={() => document.body}
    onCancel={onClose}
  >
    <MarkdownBoxViewer value={value} className={css['markdown-modal']} />
  </Modal>
);
