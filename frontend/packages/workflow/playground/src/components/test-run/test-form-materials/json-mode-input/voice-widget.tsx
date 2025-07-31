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

import { type Root } from 'react-dom/client';
import { useRequest } from 'ahooks';
import { type VoiceDetail } from '@coze-arch/bot-api/multimedia_api';
import { MultimediaApi } from '@coze-arch/bot-api';
import { useAudioPlayer } from '@coze-workflow/resources-adapter';
import { IconCozVolume, IconCozPauseFill } from '@coze-arch/coze-design/icons';
import { Avatar, Spin } from '@coze-arch/coze-design';
import { type EditorView, WidgetType } from '@codemirror/view';
import { EditorSelection } from '@codemirror/state';

import { renderDom } from './render-dom';

import css from './voice-widget.module.less';

interface VoiceDisplayProps {
  voiceId: string;
  onClick: () => void;
}

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

const VoiceDisPlay: React.FC<VoiceDisplayProps> = ({ voiceId, onClick }) => {
  const { voice, loading } = useVoiceSource(voiceId);
  const { isPlaying, togglePlayPause } = useAudioPlayer(voice?.preview_audio);

  return (
    <div className={css['voice-widget']} onClick={onClick}>
      {loading ? (
        <Spin size="small" />
      ) : (
        <>
          <Avatar shape="square" size="12px" src={voice?.icon_url} />
          <span className={css.name}>{voice?.voice_name}</span>
          {isPlaying ? (
            <IconCozPauseFill className={css.icon} onClick={togglePlayPause} />
          ) : (
            <IconCozVolume className={css.icon} onClick={togglePlayPause} />
          )}
        </>
      )}
    </div>
  );
};

interface VoiceWidgetOptions {
  voiceId: string;
  from: number;
  to: number;
}

export class VoiceWidget extends WidgetType {
  root?: Root;

  constructor(public options: VoiceWidgetOptions) {
    super();
  }

  toDOM(view: EditorView): HTMLElement {
    const handleClick = () => {
      const { from, to } = this.options;
      view.dispatch({
        selection: EditorSelection.range(from, to),
      });
    };
    const { root, dom } = renderDom<VoiceDisplayProps>(VoiceDisPlay, {
      voiceId: this.options.voiceId,
      onClick: handleClick,
    });
    this.root = root;
    return dom;
  }

  getEqKey() {
    return [this.options.voiceId].join('');
  }

  eq(prev) {
    return prev.getEqKey() === this.getEqKey();
  }

  destroy(): void {
    this.root?.unmount();
  }
}
