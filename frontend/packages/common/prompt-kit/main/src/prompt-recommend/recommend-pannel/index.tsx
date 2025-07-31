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

import {
  type ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import cls from 'classnames';
import { useEditor } from '@coze-editor/editor/react';
import { type EditorAPI } from '@coze-editor/editor/preset-prompt';
import { I18n } from '@coze-arch/i18n';
import { IconCozArrowRightFill } from '@coze-arch/coze-design/icons';
import { Tabs, TabPane, Button } from '@coze-arch/coze-design';
import {
  insertToNewline,
  type PromptContextInfo,
} from '@coze-common/prompt-kit-base/shared';

import { RecommendCardLoading } from '../recommend-card/card-loading';
import { ViewAll, RecommendCard } from '../recommend-card';
import { useGetLibrarys } from '../hooks/use-get-librarys';
import { useScrollControl } from '../hooks/use-case/use-scroll-control';
import { usePromptLibraryModal } from '../../prompt-library';
import { EmptyRecommend } from './empty';

import styles from './index.module.less';

import '@coze-common/prompt-kit-base/shared/css';
import { LeftScrollButton, RightScrollButton } from './scroll-button';
const LIMIT_LIBRARY_SIZE = 6;

type TabType = 'Recommended' | 'Team';
const getTabLabelMap = (isPersonal: boolean) => ({
  Recommended: I18n.t('prompt_resource_recommended'),
  Team: isPersonal
    ? I18n.t('prompt_resource_personal')
    : I18n.t('prompt_resource_team'),
});

interface ActionExtraInfo {
  id: string;
  category: string;
}

interface RecommendPannelProps {
  className?: string;
  cardClassName?: string;
  listContainerClassName?: string;
  tabs: TabType[];
  /** For event tracking: page source */
  source: string;
  importPromptWhenEmpty?: string;
  spaceId: string;
  /** For event tracking: bot_id */
  botId?: string;
  /** For event tracking: project_id */
  projectId?: string;
  /** For event tracking: workflow_id */
  workflowId?: string;
  isPersonal?: boolean;
  enableLibrary?: boolean;
  getConversationId?: () => string | undefined;
  getPromptContextInfo?: () => PromptContextInfo;
  onInsertPrompt?: (prompt: string, info?: ActionExtraInfo) => void;
  onUpdateSuccess?: (
    mode: 'create' | 'edit' | 'info',
    info: ActionExtraInfo,
  ) => void;
  onCopyPrompt?: (info: ActionExtraInfo) => void;
  onDeletePrompt?: (info: ActionExtraInfo) => void;
  ref: ForwardedRef<RecommendPannelRef>;
}
/* eslint-disable @coze-arch/max-line-per-function */
export const Index = (props: RecommendPannelProps) => {
  const domRef = useRef<HTMLDivElement | null>(null);
  const {
    className,
    cardClassName,
    listContainerClassName,
    onInsertPrompt,
    tabs,
    spaceId,
    enableLibrary = false,
    getConversationId,
    getPromptContextInfo,
    importPromptWhenEmpty,
    source,
    botId,
    projectId,
    workflowId,
    ref,
    isPersonal = false,
    onCopyPrompt,
    onDeletePrompt,
    onUpdateSuccess,
  } = props;
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>(tabs[0]);
  const editor = useEditor<EditorAPI>();

  const handleInsertPrompt = async (prompt: string, id: string) => {
    const insertPrompt = await insertToNewline({ editor, prompt });
    onInsertPrompt?.(insertPrompt, { id, category: activeTab });
  };

  const { loading, data, runAsync } = useGetLibrarys();
  const isEmpty = !loading && data?.[activeTab]?.length === 0;
  const { open, node: PromptLibrary } = usePromptLibraryModal({
    spaceId,
    getConversationId,
    editor,
    isPersonal,
    source,
    botId,
    projectId,
    workflowId,
    getPromptContextInfo,
    importPromptWhenEmpty,
    onInsertPrompt,
    onUpdateSuccess: (mode, selectedLibrary) => {
      runAsync(activeTab, {
        space_id: spaceId,
        size: LIMIT_LIBRARY_SIZE,
      });
      onUpdateSuccess?.(mode, selectedLibrary);
    },
    onCopyPrompt,
    onDeletePrompt,
  });
  useEffect(() => {
    if (!spaceId) {
      return;
    }
    runAsync(activeTab, {
      space_id: spaceId,
      size: LIMIT_LIBRARY_SIZE,
    });
  }, [spaceId, activeTab]);

  const { scrollRefs, canScrollLeft, canScrollRight, handleScroll } =
    useScrollControl({
      activeTab,
      tabs,
      loading,
      data,
    });

  useImperativeHandle(ref, () => ({
    refresh: (tab: 'Recommended' | 'Team') => {
      runAsync(tab, {
        space_id: spaceId,
        size: LIMIT_LIBRARY_SIZE,
      });
    },
  }));

  return (
    <div
      ref={el => {
        if (typeof ref === 'function') {
          ref(null);
        }
        domRef.current = el;
      }}
      className={cls(
        styles['recommend-pannel'],
        'flex flex-col justify-between w-full',
        'absolute bottom-0 left-0 right-0',
        'py-3 px-5',
        className,
      )}
    >
      <Tabs
        type="button"
        activeKey={activeTab}
        onChange={key => setActiveTab(key as (typeof tabs)[number])}
        tabBarExtraContent={
          enableLibrary ? (
            <div
              className="coz-fg-primary text-sm flex items-center cursor-pointer font-medium"
              onClick={() => open({ defaultActiveTab: activeTab })}
            >
              <Button
                icon={<IconCozArrowRightFill className="!coz-fg-primary" />}
                color="secondary"
                iconPosition="right"
              >
                <span className="coz-fg-primary">
                  {I18n.t('workflow_prompt_editor_view_library')}
                </span>
              </Button>
            </div>
          ) : null
        }
      >
        {tabs.map((item, index) => (
          <TabPane
            itemKey={item}
            tab={getTabLabelMap(isPersonal)[item]}
            className="relative"
          >
            {canScrollLeft ? (
              <LeftScrollButton handleScroll={() => handleScroll('left')} />
            ) : null}
            <div className="relative">
              <div
                ref={el => (scrollRefs.current[index] = el)}
                className={cls(
                  'relative overflow-x-auto styled-scrollbar h-[120px] box-content hover-show-scrollbar',
                  'flex-1',
                  listContainerClassName,
                )}
              >
                {isEmpty ? (
                  <EmptyRecommend />
                ) : (
                  <div className="flex gap-3 flex-row flex-nowrap overflow-visible h-full min-w-min">
                    {loading
                      ? Array.from({ length: LIMIT_LIBRARY_SIZE }).map(
                          (_, _index) => <RecommendCardLoading key={_index} />,
                        )
                      : null}
                    {data?.[item]?.map((card, _index) => (
                      <RecommendCard
                        className={cls(cardClassName)}
                        key={card.id}
                        id={card.id}
                        position={_index === 0 ? 'topLeft' : 'top'}
                        spaceId={spaceId}
                        title={card.name}
                        description={card.description}
                        prompt={card.promptText}
                        onInsertPrompt={prompt =>
                          handleInsertPrompt(prompt, card.id)
                        }
                      />
                    ))}
                    <ViewAll onClick={() => open({ defaultActiveTab: item })} />
                  </div>
                )}
              </div>
              {canScrollRight ? (
                <RightScrollButton handleScroll={() => handleScroll('right')} />
              ) : null}
            </div>
          </TabPane>
        ))}
      </Tabs>
      {PromptLibrary}
    </div>
  );
};

interface RecommendPannelRef {
  refresh: (tab: 'Recommended' | 'Team') => void;
}
export const RecommendPannel = forwardRef<
  RecommendPannelRef,
  RecommendPannelProps
>((props, ref) => <Index {...props} ref={ref} />);
