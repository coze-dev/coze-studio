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

import { type FC, useState, useEffect } from 'react';

import { concatTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Select, RadioGroup, Radio, withField } from '@coze-arch/coze-design';

import { isRoleSpeakerValue } from './utils';
import { useGetRoleSpeakerDataSource } from './use-get-role-speaker-datasource';
import { useGetNicknameSpeakerDataSource } from './use-get-nickname-speaker-datasource';
import {
  type NicknameSpeakerValue,
  type RoleSpeakerValue,
  SpeakerType,
  type SpeakerSelectDataSource,
} from './types';
import { useSpeakerMessageSetContext } from './context';

import styles from './speaker-select.module.less';

interface SpeakerSelectProps {
  value: RoleSpeakerValue | NicknameSpeakerValue;
  onChange?: (value: RoleSpeakerValue | NicknameSpeakerValue) => void;
}

const OriginSpeakerSelect: FC<SpeakerSelectProps> = props => {
  const { value, onChange } = props;

  const { value: arrayValue, testId } = useSpeakerMessageSetContext();

  const roleDataSource = useGetRoleSpeakerDataSource();
  const nicknameDataSource = useGetNicknameSpeakerDataSource();

  const [selectValue, setSelectValue] = useState<string>();
  const [speakerType, setSpeakerType] = useState<SpeakerType>(SpeakerType.Role);

  const handleSpeakerTypeChange = e => {
    setSpeakerType(e.target.value);
  };

  useEffect(() => {
    if (!value) {
      setSelectValue(value);
      return;
    }

    if (isRoleSpeakerValue(value)) {
      setSelectValue(value.biz_role_id);
      setSpeakerType(SpeakerType.Role);
    } else {
      setSelectValue((value as NicknameSpeakerValue).nickname);
      setSpeakerType(SpeakerType.Nickname);
    }
  }, [value]);

  const outerTopSlotNode = (
    <RadioGroup
      className={`${styles['speaker-type-radio']} w-full mb-4`}
      type="button"
      value={speakerType}
      onChange={handleSpeakerTypeChange}
    >
      <Radio
        value={SpeakerType.Role}
        className="w-[50%]"
        data-testid={concatTestId(
          testId,
          'messageSet',
          'speakerSlect',
          'type',
          'player',
        )}
      >
        {I18n.t(
          'scene_workflow_chat_node_conversation_visibility_custom_roles',
          {},
          'Player',
        )}
      </Radio>
      <Radio
        value={SpeakerType.Nickname}
        className="w-[50%]"
        data-testid={concatTestId(
          testId,
          'messageSet',
          'speakerSlect',
          'type',
          'nickname',
        )}
      >
        {I18n.t(
          'scene_workflow_chat_node_conversation_visibility_custom_variable',
          {},
          'Nickname Variables',
        )}
      </Radio>
    </RadioGroup>
  );

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const handleSelect = (value, record) => {
    onChange?.({
      ...record?.extra,
    });
  };

  function normalizeDataSource(
    dataSource: SpeakerSelectDataSource,
    key: string,
  ) {
    const arrayValueWithoutSelectValue = arrayValue?.filter(
      _value => _value?.[key] !== selectValue,
    );

    return dataSource.map(item => {
      if (
        arrayValueWithoutSelectValue?.find(
          _value => item?.[key] === _value?.[key],
        )
      ) {
        return {
          ...item,
          disabled: true,
        };
      } else {
        return item;
      }
    });
  }

  const dataSource =
    speakerType === SpeakerType.Role
      ? normalizeDataSource(roleDataSource, 'biz_role_id')
      : normalizeDataSource(nicknameDataSource, 'nickname');

  return (
    <Select
      value={selectValue}
      className="w-full"
      dropdownMatchSelectWidth
      outerTopSlot={outerTopSlotNode}
      dropdownStyle={{
        width: 320,
      }}
      placeholder={I18n.t(
        'scene_workflow_chat_node_conversation_content_speaker_placeholder',
        {},
        '请选择发言人',
      )}
      onSelect={handleSelect}
      data-testid={concatTestId(testId, 'messageSet', 'speakerSelect')}
      emptyContent={I18n.t('workflow_detail_node_nodata')}
    >
      {dataSource.map(item => (
        <Select.Option
          key={item.value}
          {...item}
          data-testid={concatTestId(
            testId,
            'messageSet',
            'speakerSelect',
            'option',
            item.value,
          )}
        >
          {item.label}
        </Select.Option>
      ))}
    </Select>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SpeakerSelect: any = withField(OriginSpeakerSelect);
