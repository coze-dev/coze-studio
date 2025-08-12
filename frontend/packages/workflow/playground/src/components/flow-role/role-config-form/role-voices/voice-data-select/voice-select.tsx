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

import { useEffect, useRef, useState } from 'react';

import { useInViewport } from 'ahooks';
import { I18n } from '@coze-arch/i18n';
import { IconCozEmpty } from '@coze-arch/coze-design/icons';
import {
  CozAvatar,
  SegmentTab,
  Select,
  Tag,
  Typography,
  type SelectProps,
} from '@coze-arch/coze-design';
import { type VoiceConfig } from '@coze-arch/bot-api/workflow_api';
import { VoiceScene } from '@coze-arch/bot-api/playground_api';

import { VoicePlayer } from '../voice-player';
import { useVoiceOptions } from './use-voice-options';

// packages/studio/space-bot/src/component/text-to-speech/use-choose-voice/voice-select.tsx
function LoadMoreTrigger({ onLoadMore }: { onLoadMore: () => void }) {
  const divRef = useRef<HTMLDivElement>(null);
  const [isInView] = useInViewport(divRef);

  useEffect(() => {
    if (!isInView) {
      return;
    }
    onLoadMore?.();
  }, [isInView]);

  return <div ref={divRef} style={{ height: 1 }} />;
}

const voiceTabs = [
  {
    label: I18n.t('workflow_select_voice_official'),
    value: VoiceScene.Preset,
  },
  {
    label: I18n.t('workflow_select_voice_library'),
    value: VoiceScene.Library,
  },
];

interface VoiceDataSelectProps {
  language?: string;
  value?: VoiceConfig;
  onChange: (v: { voice_id: string; voice_name: string }) => void;
}

export const VoiceDataSelect: React.FC<VoiceDataSelectProps> = ({
  value,
  language,
  onChange,
}) => {
  const [voiceType, setVoiceType] = useState(VoiceScene.Preset);

  const { loading, options, loadMore, loadingMore } = useVoiceOptions({
    language,
    voiceType,
  });

  const handleChange = (v: string) => {
    const voice = options.find(item => item.id === v);
    if (voice) {
      onChange({
        voice_id: v,
        voice_name: voice.name,
      });
    }
  };

  const selectedOption = options.find(i => i.id === value?.voice_id);

  return (
    <>
      <Select
        loading={loading}
        value={value?.voice_id}
        disabled={!language}
        className="grow mr-[8px]"
        renderSelectedItem={() => selectedOption?.name ?? value?.voice_name}
        onChange={handleChange as SelectProps['onChange']}
        dropdownClassName="w-[308px] min-h-[152px] [&_.semi-select-loading-wrapper]:text-center"
        outerTopSlot={
          <SegmentTab
            size="small"
            className="mb-[2px]"
            value={voiceType}
            options={voiceTabs}
            onChange={e => setVoiceType(e.target.value)}
          />
        }
        innerBottomSlot={
          // When the Select option scrolls to the bottom, if it is not currently loaded, it triggers Load More
          <LoadMoreTrigger
            onLoadMore={() => {
              if (!loading && !loadingMore) {
                loadMore();
              }
            }}
          />
        }
        emptyContent={
          <div className="h-[92px] flex flex-col justify-center   items-center gap-[4px]">
            <IconCozEmpty className="text-[32px] coz-fg-dim" />
            <Typography.Text fontSize="14px" weight={500}>
              {I18n.t('voice_select_library_null')}
            </Typography.Text>
          </div>
        }
      >
        {options.map(item => (
          <Select.Option
            className="[&_.option-text-wrapper]:overflow-hidden"
            value={item.id}
            key={item.id}
          >
            <div className="h-[40px] w-full flex items-center gap-[8px] px-[8px] py-[6px]">
              <CozAvatar
                type="platform"
                size="default"
                src={item.icon_url}
                className="shrink-0"
              />
              <div className="grow flex flex-col items-start overflow-hidden">
                <Typography.Text fontSize="14px">{item.name}</Typography.Text>
                {item.create_user_info ? (
                  <div className="flex gap-[4px] items-center">
                    <CozAvatar
                      size="micro"
                      src={item.create_user_info.icon_url}
                    />
                    <Typography.Text fontSize="12px">
                      {item.create_user_info.nick_name}
                    </Typography.Text>
                    <Typography.Text fontSize="12px" type="secondary">
                      @{item.create_user_info.name}
                    </Typography.Text>
                  </div>
                ) : item.scene ? (
                  <Tag size="mini" color="grey">
                    {item.scene}
                  </Tag>
                ) : null}
              </div>
              <div className="shrink-0">
                <VoicePlayer preview={item.preview_audio} />
              </div>
            </div>
          </Select.Option>
        ))}
      </Select>
      <VoicePlayer
        key={selectedOption?.id}
        preview={selectedOption?.preview_audio}
      />
    </>
  );
};
