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

import { useState, type PropsWithChildren, type FC } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Banner, Space } from '@coze-arch/bot-semi';
import { IconPullDown } from '@coze-arch/bot-icons';

import { type CheckParamsProps } from '../types';
import { DiyMdBox, HeadingType } from './diy-mdbox';

import s from './index.module.less';

const Header = ({
  // @ts-expect-error -- linter-disable-autofix
  activeTab,
  // @ts-expect-error -- linter-disable-autofix
  setActiveTab,
  // @ts-expect-error -- linter-disable-autofix
  hideRawResponse,
  // @ts-expect-error -- linter-disable-autofix
  showRaw,
  // @ts-expect-error -- linter-disable-autofix
  setShowRaw,
}) => {
  const handleOpenRawResponse = () => {
    setShowRaw(!showRaw);
  };
  return (
    <div className={s['debug-check-header']}>
      <div className={s['debug-check-tab']}>
        <div
          className={classNames(s['debug-check-tab-item'], {
            [s['debug-check-tab-item-active']]:
              activeTab === HeadingType.Request,
          })}
          onClick={() => setActiveTab(HeadingType.Request)}
        >
          Request
        </div>
        <div className={s['debug-check-tab-line']}></div>
        <div
          className={classNames(s['debug-check-tab-item'], {
            [s['debug-check-tab-item-active']]:
              activeTab === HeadingType.Response,
          })}
          onClick={() => setActiveTab(HeadingType.Response)}
        >
          Response
        </div>
      </div>
      {activeTab === HeadingType.Response && !hideRawResponse ? (
        <Space spacing={8}>
          <span>Raw Response</span>
          <IconPullDown
            className={classNames(s.icon, {
              [s.open]: showRaw,
            })}
            onClick={handleOpenRawResponse}
          ></IconPullDown>
        </Space>
      ) : null}
    </div>
  );
};

const ProcessContent: FC<PropsWithChildren> = ({ children }) => (
  <div className={s['process-content']}>{children}</div>
);

/** Stringify indent */
const INDENTATION_SPACES = 2;
const LLMAndAPIContent: FC<{
  toolMessageUnit: CheckParamsProps;
}> = ({ toolMessageUnit }) => {
  const { request, response, failReason, rawResp } = toolMessageUnit;
  const [activeTab, setActiveTab] = useState(1);

  const [showRaw, setShowRaw] = useState(false);
  return (
    <>
      {!request && !response ? (
        <div className={s['llm-debug-empty']}>
          <div className={s['llm-debug-empty-content']}>
            {I18n.t('plugin_s4_debug_empty')}
          </div>
        </div>
      ) : (
        <div className={s['debug-result-content']}>
          <Header
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            hideRawResponse={!(!failReason && rawResp)}
            showRaw={showRaw}
            setShowRaw={setShowRaw}
          />
          {activeTab === 1 ? (
            <>
              <div className={s['llm-api-content']}>
                <DiyMdBox
                  markDown={
                    request
                      ? JSON.stringify(
                          JSON.parse(request || '{}'),
                          null,
                          INDENTATION_SPACES,
                        )
                      : ''
                  }
                  headingType={activeTab}
                  showRaw={showRaw}
                />
              </div>
            </>
          ) : (
            <>
              <div className={s['llm-api-content']}>
                {failReason ? (
                  <div className={s['error-reason-box']}>
                    <Banner
                      className={s['error-reason']}
                      fullMode={false}
                      icon={null}
                      closeIcon={null}
                      type="danger"
                      description={
                        <div>
                          <div>{I18n.t('plugin_s4_debug_detail')}</div>
                          <div style={{ wordBreak: 'break-word' }}>
                            {failReason}
                          </div>
                        </div>
                      }
                    />
                  </div>
                ) : (
                  <DiyMdBox
                    headingType={activeTab}
                    markDown={JSON.stringify(
                      JSON.parse(response || '{}'),
                      null,
                      INDENTATION_SPACES,
                    )}
                    rawResponse={JSON.stringify(
                      JSON.parse(rawResp || '{}'),
                      null,
                      INDENTATION_SPACES,
                    )}
                    showRaw={showRaw}
                  />
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export const DebugCheck: FC<{
  checkParams: CheckParamsProps;
}> = ({ checkParams }) => (
  <ProcessContent>
    <LLMAndAPIContent toolMessageUnit={checkParams} />
  </ProcessContent>
);
