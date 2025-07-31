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

import { useState } from 'react';

import {
  useField,
  observer,
  type ObjectField,
} from '@coze-workflow/test-run/formily';
import { I18n } from '@coze-arch/i18n';
import { type VoiceConfig } from '@coze-arch/bot-api/workflow_api';
import { IconCozEdit, IconCozPlus } from '@coze-arch/coze-design/icons';
import { IconButton, Button, Modal, Typography } from '@coze-arch/coze-design';

import { VoiceSelect } from './voice-select';
import {
  type LanguageOption,
  useLanguageOptions,
} from './voice-data-select/use-language-options';
import { formatVoicesObj2Arr, type VoiceValue } from './utils';

interface AddVoicesFormProps {
  initialValue: Record<string, VoiceConfig>;
  languageOptions: LanguageOption[];
  onChange: (v: Record<string, VoiceConfig>) => void;
  onCancel: () => void;
}

const getLanguages = (value: VoiceValue[]) =>
  value.map(i => i.language).filter((i): i is string => Boolean(i));

const AddVoicesForm: React.FC<AddVoicesFormProps> = ({
  initialValue,
  languageOptions,
  onChange,
  onCancel,
}) => {
  const [innerValue, setInnerValue] = useState(
    formatVoicesObj2Arr(initialValue),
  );

  const handleLanguageChange = (idx: number, val: VoiceValue) => {
    setInnerValue(innerValue.map((i, index) => (index === idx ? val : i)));
  };

  const handleDelete = (idx: number) => {
    setInnerValue(innerValue.filter((_, index) => index !== idx));
  };

  const handleAdd = () => {
    setInnerValue([...innerValue, {}]);
  };

  const handleSubmit = () => {
    const next = innerValue.reduce(
      (prev, cur) => {
        if (cur.data && cur.language) {
          prev[cur.language] = cur.data;
        }
        return prev;
      },
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      {} as Record<string, VoiceConfig>,
    );
    onChange(next);
  };

  const canAdd = innerValue.length < languageOptions.length;

  return (
    <div className="flex flex-col">
      {innerValue.map((item, idx) => (
        <VoiceSelect
          key={idx}
          value={item}
          onChange={v => handleLanguageChange(idx, v)}
          onDelete={() => handleDelete(idx)}
          languageOptions={languageOptions}
          disabledLanguages={getLanguages(innerValue)}
        />
      ))}
      {canAdd ? (
        <div className="px-[8px] py-[12px]">
          <Button
            color="primary"
            className="flex w-[140px]"
            icon={<IconCozPlus />}
            onClick={handleAdd}
          >
            {I18n.t('bot_edit_voices_modal_add_language')}
          </Button>
        </div>
      ) : null}
      <div className="flex justify-end gap-[12px] mt-[24px]">
        <Button onClick={onCancel} color="primary">
          {I18n.t('cancel')}
        </Button>
        <Button onClick={handleSubmit}>{I18n.t('background_confirm')}</Button>
      </div>
    </div>
  );
};

export const AddVoices: React.FC = observer(() => {
  const [visible, setVisible] = useState(false);
  const field = useField<ObjectField>();
  const { value, disabled } = field;

  const voiceConfig = value?.config || {};

  const isEdit = Object.values(voiceConfig).length > 0;

  const { options: languageOptions } = useLanguageOptions();

  const handleChange = (v: Record<string, VoiceConfig>) => {
    field.setValue({
      ...value,
      config: v,
    });
    setVisible(false);
  };

  return (
    <>
      <IconButton
        color="secondary"
        size="small"
        disabled={disabled}
        icon={isEdit ? <IconCozEdit /> : <IconCozPlus />}
        onClick={() => setVisible(true)}
      />
      <Modal
        visible={visible}
        title={I18n.t('bot_edit_voices_modal_title')}
        onCancel={() => setVisible(false)}
        footer={null}
        className="[&_.semi-modal-footer]:hidden"
      >
        <Typography.Text fontSize="14px" className="mb-[16px]">
          {I18n.t('bot_edit_voices_modal_description', {
            platform: IS_OVERSEA ? 'Cici' : '豆包',
          })}
        </Typography.Text>
        <AddVoicesForm
          initialValue={voiceConfig}
          languageOptions={languageOptions}
          onCancel={() => setVisible(false)}
          onChange={handleChange}
        />
      </Modal>
    </>
  );
});
