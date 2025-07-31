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

import { useNavigate, useRouteError } from 'react-router-dom';
import { useMemo, useState, type FC } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { escape } from 'lodash-es';
import { BaseEnum } from '@coze-arch/web-context';
import { getSlardarInstance } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { Typography, UIButton } from '@coze-arch/bot-semi';
import { useRouteConfig } from '@coze-arch/bot-hooks';
import { isCustomError, useRouteErrorCatch } from '@coze-arch/bot-error';
import { IllustrationNoAccess } from '@douyinfe/semi-illustrations';
import { useSpaceStore, useSpaceApp } from '@coze-foundation/space-store';

import s from './index.module.less';

// The configuration of i18n, align the starling copy and then replace it.
export const GlobalError: FC = () => {
  const navigate = useNavigate();
  const spaceApp = useSpaceApp();
  const { menuKey: base } = useRouteConfig();
  const { id, getPersonalSpaceID } = useSpaceStore(
    useShallow(spaceStore => ({
      id: spaceStore.space.id,
      getPersonalSpaceID: spaceStore.getPersonalSpaceID,
    })),
  );
  const error = useRouteError();
  useRouteErrorCatch(error);

  const isLazyLoadError = useMemo(() => {
    if (hasErrorMessage(error)) {
      return /Minified\sReact\serror\s\#306/i.test(error.message);
    }
  }, [error]);

  const customGlobalErrorConfig = useMemo(() => {
    if (isCustomError(error)) {
      return error.ext?.customGlobalErrorConfig;
    }
  }, [error]);

  const [sessionId] = useState(() => getSlardarInstance()?.config()?.sessionId);

  return (
    <div className={s.wrapper}>
      <div className={s.content}>
        <IllustrationNoAccess width={140} height={140} />
        <Typography.Title className={s.title}>
          {customGlobalErrorConfig?.title ??
            I18n.t('errorpage_bot_title', {}, `Failed to view the ${spaceApp}`)}
        </Typography.Title>
        <Typography.Paragraph className={s.paragraph}>
          {customGlobalErrorConfig?.subtitle ??
            I18n.t(
              'errorpage_subtitle',
              {},
              "Please check your link or try again after joining the bot's team.",
            )}
        </Typography.Paragraph>
        {!!sessionId && (
          <div className="leading-[12px] mb-[24px] text-[12px] text-gray-400">
            {sessionId}
          </div>
        )}
        <UIButton
          theme="solid"
          onClick={() => {
            let url = '';
            if (BaseEnum.Space === base) {
              const spaceId =
                id ??
                getPersonalSpaceID() ??
                // There is no personal space under the enterprise, so jump to the first space by default.
                useSpaceStore.getState().spaceList[0]?.id;
              url = spaceId ? `/space/${spaceId}/${spaceApp}` : '/space';
            } else if (base && base in BaseEnum) {
              url = `/${base}`;
            } else {
              url = '/';
            }

            if (!isLazyLoadError) {
              navigate(url);
            } else {
              window.location.href = escape(url);
            }
          }}
        >
          {I18n.t('errorpage_bot_btn', {}, 'Go to Bot Platform')}
        </UIButton>
      </div>
    </div>
  );
};

function hasErrorMessage(e: unknown): e is { message: string } {
  if (!e || typeof e !== 'object') {
    return false;
  }
  if ('message' in e && typeof e.message === 'string') {
    return true;
  }
  return false;
}
