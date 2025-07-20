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
 
import { useParams } from 'react-router-dom';
import React, {
  useState,
  type FC,
  type PropsWithChildren,
  type ReactNode,
  type ComponentType,
} from 'react';

import classNames from 'classnames';
import { useUpdateEffect } from 'ahooks';
import { userStoreService } from '@coze-studio/user-store';
import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';
import { Spin } from '@coze-arch/bot-semi';
import { CustomError } from '@coze-arch/bot-error';
import { useBotPageStore } from '@coze-agent-ide/space-bot/store';
import { BotDebugChatAreaProviderAdapter } from '@coze-agent-ide/chat-area-provider-adapter';

import s from './index.module.less';

export interface CustomProviderProps {
  botId: string;
}
export interface BotEditorLayoutProps {
  hasHeader?: boolean;
}

export interface BotEditorLayoutSlot {
  header?: ReactNode;
  headerBottom?: ReactNode;
  headerTop?: ReactNode;
  customProvider?: ComponentType<PropsWithChildren<CustomProviderProps>>;
}

const DefaultFragment: React.FC<PropsWithChildren<CustomProviderProps>> = ({
  children,
}) => <React.Fragment>{children}</React.Fragment>;

const BotEditorInitLayoutImpl: FC<
  PropsWithChildren<
    Omit<BotEditorLayoutProps, 'loading'> &
      BotEditorLayoutSlot &
      CustomProviderProps
  >
> = ({
  children,
  botId,
  hasHeader = true,
  headerBottom,
  headerTop,
  header,
  customProvider,
}) => {
  // 初次加载
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const init = usePageRuntimeStore(state => state.init);
  const userInfo = userStoreService.useUserInfo();

  const modeSwitching = useBotPageStore(state => state.bot.modeSwitching);
  const CustomProvider = customProvider || DefaultFragment;
  // 因为clearStore会保留init值，在切换bot时，init是true，不会是初始值false
  useUpdateEffect(() => {
    // init每次initStore都会被更新状态，但这里只需要记录初次的loading，所以需要对isFirstLoad判断
    if (isFirstLoad && init) {
      // 如果init完成并且是首次load，表示初次请求完成，将isFirstLoad置为false
      setIsFirstLoad(false);
    }
  }, [init]);

  return (
    <div className={s.wrapper}>
      {isFirstLoad && !init ? (
        <Spin spinning wrapperClassName="h-full w-full" />
      ) : (
        <CustomProvider botId={botId}>
          <BotDebugChatAreaProviderAdapter
            botId={botId}
            userId={userInfo?.user_id_str}
          >
            <Spin
              spinning={modeSwitching}
              wrapperClassName={classNames(s['spin-wrapper'], s['top-level'])}
            >
              {headerTop}
              {hasHeader ? header : null}
              {headerBottom}
              {children}
            </Spin>
          </BotDebugChatAreaProviderAdapter>
        </CustomProvider>
      )}
    </div>
  );
};

export const BotEditorInitLayout: React.FC<
  PropsWithChildren<BotEditorLayoutProps & BotEditorLayoutSlot>
> = props => {
  const { bot_id } = useParams<DynamicParams>();
  if (!bot_id) {
    throw new CustomError('normal_error', 'failed to get bot_id');
  }

  return <BotEditorInitLayoutImpl {...props} botId={bot_id} />;
};
export default BotEditorInitLayout;
