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

import { Component, type ReactNode } from 'react';

import { isEmpty, last } from 'lodash-es';
import JsonView, { ValueQuote } from '@uiw/react-json-view';
import { I18n } from '@coze-arch/i18n';
import { Tooltip, Typography } from '@coze-arch/coze-design';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';

import { isValidHttpUrl } from './utils/url';
import { type Result, parse, type JsonValue } from './utils/parse';
import { ImagePreview, type JsonPreviewBasePlugin } from './plugins';
import OverlayAPI from './common/overlay';
import { NotSupport } from './common/not-support';

import styles from './index.module.less';

interface JsonLinkPreviewProps {
  src: unknown[];
  bot_id?: string;
  space_id: string;
  entityId?: string;
}

export class JsonLinkPreview extends Component<JsonLinkPreviewProps> {
  parse: (inputValue: JsonValue[]) => Record<string, Result>;
  linkMap: Record<string, Result>;
  plugins: JsonPreviewBasePlugin[];
  constructor(props: JsonLinkPreviewProps) {
    super(props);
    this.parse = parse;
    this.linkMap = this.parse(props.src as JsonValue[]);
    this.plugins = [new ImagePreview()];
  }

  componentDidUpdate(prevProps: Readonly<JsonLinkPreviewProps>): void {
    this.linkMap = this.parse(this.props.src as JsonValue[]);
  }

  handleClick = (
    link: string,
    contentType: string,
    extraInfo?: Record<string, string>,
  ) => {
    sendTeaEvent(EVENT_NAMES.preview_link_click, {
      host: window.location.href,
      content_type: contentType,
      bot_id: this.props.bot_id || this.props.entityId || '',
      space_id: this.props.space_id,
    });
    const renderPlugins = this.plugins.filter(plugin =>
      plugin.match(contentType),
    );
    if (isEmpty(renderPlugins)) {
      OverlayAPI.show({
        content(onClose) {
          return (
            <div className="w-full h-full flex items-center justify-center">
              <NotSupport
                onClose={onClose}
                url={link}
                filename={extraInfo?.fileName}
              />
            </div>
          );
        },
      });
      return;
    }

    renderPlugins.sort((a, b) => a.priority - b.priority);

    const renderPlugin = last(renderPlugins);
    renderPlugin?.render(link, extraInfo);
  };

  render(): ReactNode {
    return (
      <JsonView
        className={styles['json-link-preview']}
        style={{
          fontSize: '12px !important',
        }}
        value={this.props.src}
        enableClipboard={false}
        displayDataTypes={false}
        indentWidth={2}
        collapsed={5}
        shortenTextAfterLength={300}
        highlightUpdates={false}
      >
        <JsonView.String
          render={(_, { type, value }) => {
            if (
              type === 'value' &&
              typeof value === 'string' &&
              isValidHttpUrl(value)
            ) {
              return (
                <Tooltip
                  content={
                    <Typography.Text
                      link
                      onClick={() => {
                        this.handleClick(
                          value,
                          this.linkMap[value]?.contentType || '',
                          this.linkMap[value]?.extraInfo,
                        );
                      }}
                    >
                      {I18n.t('analytics_query_aigc_detail')}
                    </Typography.Text>
                  }
                >
                  <a
                    href={value}
                    className={styles.link}
                    onClick={event => {
                      event.preventDefault();
                    }}
                  >
                    <ValueQuote />
                    {value}
                    <ValueQuote />
                  </a>
                </Tooltip>
              );
            }
          }}
        />
      </JsonView>
    );
  }
}
