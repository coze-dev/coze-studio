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

import { type FC, Fragment } from 'react';

import cls from 'classnames';
import { cozeOfficialHost } from '@coze-studio/open-env-adapter';
import { I18n } from '@coze-arch/i18n';

import { type FooterConfig } from '@/types/client';

import styles from './index.module.less';

const getDefaultText = () =>
  I18n.t('web_sdk_official_banner', {
    docs_link: (
      <a
        key="web_sdk_official_banner"
        className={styles.link}
        href={cozeOfficialHost}
        target="_blank"
      >
        {I18n.t('web_sdk_official_banner_link')}
      </a>
    ),
  });

const getTextByExpress = (
  expressionText: string,
  linkvars?: Record<
    string,
    {
      text: string;
      link: string;
    }
  >,
) => {
  const arrLinks: React.ReactNode[] = [];
  const splitLinkTag = '{{{link}}}';
  const textWithLinkTags = expressionText.replace(
    /\{\{\s*(\w+)\s*\}\}/g,
    (_, key) => {
      const { link, text: linkText } = linkvars?.[key] || {};
      if (link && linkText) {
        arrLinks.push(
          <a className={styles.link} href={link} target="_blank">
            {linkText}
          </a>,
        );
        return splitLinkTag;
      } else {
        arrLinks.push(linkText || '');
      }
      return splitLinkTag;
    },
  );
  return textWithLinkTags.split(splitLinkTag).map((item, index) => (
    <Fragment key={`text_link_${index}`}>
      {item}
      {arrLinks[index]}
    </Fragment>
  ));
};

const ChatFooter: FC<
  FooterConfig & {
    footerClassName?: string;
    textClassName?: string;
    theme?: 'bg-theme' | 'light';
  }
> = ({
  isShow = true,
  expressionText,
  linkvars,
  footerClassName,
  textClassName,
  theme,
}) =>
  isShow ? (
    <footer
      className={cls(styles.footer, footerClassName, {
        [styles['bg-theme']]: theme === 'bg-theme',
      })}
    >
      <span className={cls(styles.text, textClassName)}>
        {expressionText
          ? getTextByExpress(expressionText, linkvars)
          : getDefaultText()}
      </span>
    </footer>
  ) : null;

export default ChatFooter;
