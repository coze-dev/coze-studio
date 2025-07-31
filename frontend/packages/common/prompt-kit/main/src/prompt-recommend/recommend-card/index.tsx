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

import { useEffect, useState } from 'react';

import cls from 'classnames';
import { useEditor } from '@coze-editor/editor/react';
import { type EditorAPI } from '@coze-editor/editor/preset-prompt';
import { Popover, Button, Typography } from '@coze-arch/coze-design';
import { PlaygroundApi } from '@coze-arch/bot-api';
import { ThemeExtension } from '@coze-common/editor-plugins/theme';
import { LibraryBlockWidget } from '@coze-common/editor-plugins/library-insert';
import { InputSlotWidget } from '@coze-common/editor-plugins/input-slot';
import {
  PromptEditorRender,
  PromptEditorProvider,
} from '@coze-common/prompt-kit-base/editor';
import { I18n } from '@coze-arch/i18n';
import { EditorView } from '@codemirror/view';

import '@coze-common/prompt-kit-base/shared/css';

interface RecommendCardProps {
  id: string;
  title: string;
  description: string;
  position?: 'topLeft' | 'top';
  prompt?: string;
  spaceId: string;
  onInsertPrompt?: (prompt: string) => void;
  className?: string;
}

export const RecommendCard = (props: RecommendCardProps) => {
  const {
    id,
    title,
    description,
    prompt,
    onInsertPrompt,
    spaceId,
    className,
    position,
  } = props;
  const [promptText, setPromptText] = useState(prompt ?? '');
  const [isPopoverVisible, setIsPopoverVisible] = useState(false);

  useEffect(() => {
    if (prompt) {
      return;
    }

    PlaygroundApi.GetPromptResourceInfo({
      prompt_resource_id: id,
    }).then(({ data: { prompt_text } = {} }) => {
      setPromptText(prompt_text ?? '');
    });
  }, [prompt, id]);

  return (
    <PromptEditorProvider>
      <Popover
        position={position}
        visible={isPopoverVisible}
        onVisibleChange={setIsPopoverVisible}
        trigger="hover"
        key={id}
        className="rounded"
        showArrow
        // mouseLeaveDelay={150}
        // mouseEnterDelay={150}
        autoAdjustOverflow
        content={
          isPopoverVisible ? (
            <UsePromptPopoverContent
              prompt={promptText}
              title={title}
              spaceId={spaceId}
              onInsertPrompt={value => {
                onInsertPrompt?.(value);
                setIsPopoverVisible(false);
              }}
            />
          ) : null
        }
      >
        <div
          className={cls(
            'flex flex-col flex-shrink-0 flex-nowrap gap-1 px-3 py-2 relative',
            'aspect-[180/120] overflow-hidden',
            'rounded-lg border coz-stroke-primary coz-bg-max cursor-pointer',
            'coz-stroke-primary border-[0.5px] border-solid',
            'hover:coz-mg-secondary-hovered',
            className,
          )}
        >
          <Typography.Text
            className="font-medium text-lg"
            ellipsis={{ rows: 1 }}
          >
            {title}
          </Typography.Text>
          <Typography.Text className="text-base" ellipsis={{ rows: 3 }}>
            {description ?? prompt?.slice(0, 50)}
          </Typography.Text>
        </div>
      </Popover>
    </PromptEditorProvider>
  );
};

const UsePromptPopoverContent: React.FC<{
  prompt?: string;
  title: string;
  spaceId: string;
  onInsertPrompt?: (prompt: string) => void;
}> = ({ prompt = '', title, spaceId, onInsertPrompt }) => {
  const editor = useEditor<EditorAPI>();

  useEffect(() => {
    editor?.$view.dispatch({
      changes: {
        from: 0,
        to: editor?.$view.state.doc.length,
        insert: prompt,
      },
    });
  }, [editor, prompt]);

  return (
    <div className="flex flex-col justify-between w-[300px] h-[300px] gap-3">
      <div className="flex flex-col gap-1 overflow-y-auto styled-scrollbar hover-show-scrollbar">
        <div className="text-sm font-medium coz-fg-primary">{title}</div>
        <PromptEditorRender defaultValue={prompt} readonly />
        <InputSlotWidget mode="input" />
        <LibraryBlockWidget librarys={[]} readonly spaceId={spaceId} />
        <ThemeExtension
          themes={[
            EditorView.theme({
              '.cm-line': {
                paddingLeft: '0 !important',
              },
            }),
          ]}
        />
      </div>
      <div className="coz-mg-hglt hover:!coz-mg-hglt-hovered rounded">
        <Button
          color="primary"
          className="w-full font-sm font-medium !bg-transparent !coz-fg-hglt "
          onClick={() => {
            onInsertPrompt?.(prompt);
          }}
        >
          {I18n.t('prompt_resource_insert_prompt')}
        </Button>
      </div>
    </div>
  );
};

export const ViewAll = ({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) => (
  <div
    onClick={onClick}
    className={cls(
      'flex flex-col flex-shrink-0 flex-nowrap gap-1 px-3 py-2 items-center justify-center',
      'aspect-[180/120]',
      'rounded-lg border coz-stroke-primary coz-bg-max cursor-pointer text-sm',
      'coz-stroke-primary border-[0.5px] border-solid',
      'hover:coz-mg-secondary-hovered',
      className,
    )}
  >
    <div className="coz-fg-primary font-medium">
      {I18n.t('prompt_resource_view_all')}
    </div>
  </div>
);
