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

import { useShallow } from 'zustand/react/shallow';
import cls from 'classnames';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import {
  type EditorAPI,
  PromptEditorRender,
  useEditor,
  type PromptEditorRenderProps,
} from '@coze-common/prompt-kit-base/editor';
import { RecommendPannel } from '@coze-common/prompt-kit/prompt-recommend';
import {
  LibraryBlockWidget,
  LibrarySearchPopover,
} from '@coze-common/editor-plugins/library-insert';
import { InputSlotWidget } from '@coze-common/editor-plugins/input-slot';
import { SpaceType } from '@coze-arch/idl/developer_api';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { BusinessType } from '@coze-arch/bot-api/playground_api';

import { useGetLibrarysData } from '../../../hooks/use-prompt/use-get-library-data';
import { useAddLibrary } from '../../../hooks/use-prompt/use-add-library';

import styles from './index.module.less';
export interface AgentIdePromptProps extends PromptEditorRenderProps {
  isSingle: boolean;
  editorExtensions?: React.ReactNode;
}
const AgentIdePrompt = (props: AgentIdePromptProps) => {
  const { editorExtensions } = props;
  const { libraryList } = useGetLibrarysData();
  const { botId, space_id, businessType } = useBotInfoStore(
    useShallow(state => ({
      botId: state.botId,
      space_id: state.space_id,
      businessType: state.businessType,
    })),
  );
  const spaceType = useSpaceStore(state => state.space.space_type);
  const isPersonal = spaceType === SpaceType.Personal;
  const addLibrary = useAddLibrary();
  const isReadonly = useBotDetailIsReadonly();
  const editor = useEditor<EditorAPI>();
  const prompt = editor?.getValue();
  if (!props.isSingle) {
    return (
      <div
        className={cls(
          styles['agent-ide-prompt-editor'],
          'overflow-y-auto coz-bg-max',
          'h-[320px] p-[16px]',
        )}
      >
        <PromptEditorRender {...props} />
      </div>
    );
  }
  if (isReadonly) {
    return (
      <div className={styles['agent-ide-prompt-editor']}>
        <PromptEditorRender {...props} />
        <InputSlotWidget mode="input" />
        <LibraryBlockWidget
          librarys={[]}
          readonly
          onAddLibrary={addLibrary}
          spaceId={space_id}
        />
      </div>
    );
  }

  return (
    <>
      <div
        className={styles['agent-ide-prompt-editor']}
        style={{ height: '100%' }}
      >
        <PromptEditorRender {...props} />
      </div>
      <InputSlotWidget mode="input" />
      <LibraryBlockWidget
        librarys={libraryList}
        onAddLibrary={addLibrary}
        spaceId={space_id}
        // Agent IDE In the Douyin doppelganger scenario, you need to pass in the doppelganger id to determine whether the current resource exists
        avatarBotId={
          businessType === BusinessType.DouyinAvatar ? botId : undefined
        }
      />
      <LibrarySearchPopover librarys={libraryList} direction="topLeft" />
      {prompt?.length === 0 ? (
        <RecommendPannel
          source="bot_detail_page"
          tabs={['Recommended', 'Team']}
          isPersonal={isPersonal}
          importPromptWhenEmpty={props.defaultValue}
          spaceId={space_id}
          onInsertPrompt={insertPrompt => {
            props?.onChange?.(insertPrompt);
          }}
        />
      ) : null}
      {editorExtensions}
    </>
  );
};
export default AgentIdePrompt;
