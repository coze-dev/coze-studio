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

import React, { useEffect, useState } from 'react';

import { useRequest } from 'ahooks';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozPauseFill,
  IconCozPlus,
  IconCozTrashCan,
  IconCozVolume,
} from '@coze-arch/coze-design/icons';
import { Avatar, Button, IconButton } from '@coze-arch/coze-design';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { type VoiceDetail } from '@coze-arch/bot-api/multimedia_api';
import { MultimediaApi } from '@coze-arch/bot-api';
import {
  useSelectVoiceModal,
  useAudioPlayer,
} from '@coze-workflow/resources-adapter';

interface CardProps {
  voice: VoiceDetail | null;
  onDelete?: () => void;
  disabled?: boolean;
}

const VoiceCard = ({ voice, onDelete, disabled }: CardProps) => {
  const { isPlaying, togglePlayPause } = useAudioPlayer(voice?.preview_audio);

  if (!voice) {
    return null;
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--coz-mg-card-hovered)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        height: '44px',
        border: '1px solid var(--coz-stroke-primary)',
        padding: '6px',
        borderRadius: 'var(--coze-8)',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Avatar shape={'square'} size="small" src={voice.icon_url} />

        <span style={{ marginLeft: '8px', marginRight: '2px' }}>
          {voice.voice_name}
        </span>

        {isPlaying ? (
          <IconButton
            theme={'borderless'}
            disabled={disabled}
            onClick={togglePlayPause}
            size="small"
            color="secondary"
            icon={<IconCozPauseFill color="#4E40E5" />}
          />
        ) : (
          <IconButton
            theme={'borderless'}
            disabled={disabled}
            onClick={togglePlayPause}
            size="small"
            color="secondary"
            icon={<IconCozVolume color="#4E40E5" />}
          />
        )}
      </div>

      <IconButton
        disabled={disabled}
        onClick={onDelete}
        size="small"
        color="secondary"
        icon={<IconCozTrashCan />}
      />
    </div>
  );
};

const useVoiceSource = (id?: string) => {
  const [voice, setVoice] = useState<VoiceDetail | null | undefined>(null);

  const { loading } = useRequest(
    () => {
      if (!id) {
        return Promise.resolve(null).then(() => {
          setVoice(null);
          return null;
        });
      }

      return MultimediaApi.APIMGetVoice({
        voice_ids: [id],
      })
        .then(data => {
          const v = data?.data?.voices?.[0];
          setVoice(data?.data?.voices?.[0]);
          return v;
        })
        .catch(() => {
          setVoice(null);
          return null;
        });
    },
    {
      refreshDeps: [id],
    },
  );

  return {
    voice,
    setVoice,
    loading,
  };
};

interface Props {
  value?: string;
  onChange?: (v?: string) => void;
  disabled?: boolean;
}

const VoiceSelect: React.FC<Props> = props => {
  const { value, onChange, disabled } = props;
  const [voiceId, setVoiceId] = useState<string | undefined>(value);
  const spaceId = useSpaceStore(store => store.space.id) || '';

  const { voice, setVoice } = useVoiceSource(voiceId);

  useEffect(() => {
    setVoiceId(value);
  }, [value]);

  const { open: openSelectVoiceModal, modal: selectVoiceModal } =
    useSelectVoiceModal({
      spaceId,
      onSelectVoice: v => {
        setVoice(v);
        onChange?.(v.voice_id);
      },
    });

  return (
    <>
      {!voice?.voice_id ? (
        <Button
          disabled={disabled}
          style={{ width: '100%', fontWeight: '500' }}
          size={'small'}
          icon={<IconCozPlus />}
          color="primary"
          onClick={openSelectVoiceModal}
        >
          {I18n.t('workflow_variable_select_voice')}
        </Button>
      ) : (
        <VoiceCard
          disabled={disabled}
          voice={voice}
          onDelete={() => {
            setVoice(null);
            onChange?.(undefined);
          }}
        />
      )}

      {selectVoiceModal}
    </>
  );
};

export { VoiceSelect };
