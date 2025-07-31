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

import React, { useMemo, type ReactNode } from 'react';

import { concatTestId, useNodeTestId } from '@coze-workflow/base';
import {
  IconCozCodeFill,
  IconCozPlayCircle,
  IconCozSideCollapse,
} from '@coze-arch/coze-design/icons';
import {
  Select,
  Tooltip,
  Button,
  IconButton,
  Typography,
} from '@coze-arch/coze-design';

const { Text } = Typography;

import { type EditorProps, type LanguageType } from '../../interface';

import style from './style.module.less';

import { I18n } from '@coze-arch/i18n';

const HELP_DOCUMENT_LINK = IS_OVERSEA
  ? '/docs/guides/code_node?_lang=en'
  : '/docs/guides/code_node';

interface Props extends EditorProps {
  children: ReactNode;
  onLanguageSelect?: (language: LanguageType) => void;
  language: LanguageType;
}

export const Layout = ({
  children,
  title,
  language,
  onClose,
  onTestRun,
  testRunIcon,
  onLanguageSelect,
  languageTemplates,
}: Props) => {
  const optionList = useMemo(
    () =>
      languageTemplates?.map(e => ({
        value: e.language,
        label: e.displayName,
      })),
    [languageTemplates],
  );

  const { getNodeSetterId } = useNodeTestId();
  const setterTestId = getNodeSetterId('biz-editor-layout');

  return (
    <div className={style.container}>
      <div className={style.header}>
        <div className={style.title}>
          <div className={style['title-icon']}>
            <IconCozCodeFill />
          </div>
          <div className={style['title-content']}>{title}</div>

          <Tooltip
            content={
              <div>
                {I18n.t('code_node_more_info')}
                <Text link={{ href: HELP_DOCUMENT_LINK, target: '_blank' }}>
                  {I18n.t('code_node_help_doc')}
                </Text>
              </div>
            }
            theme={'dark'}
          >
            <Select
              onChange={value => onLanguageSelect?.(value as LanguageType)}
              value={language}
              data-testid={concatTestId(setterTestId, 'language-select')}
              renderSelectedItem={item => (
                <span
                  style={{
                    fontSize: 12,
                    color: 'var(--coz-fg-secondary)',
                  }}
                >
                  {I18n.t('code_node_language')} {item.label}
                </span>
              )}
              size={'small'}
              optionList={optionList}
            ></Select>
          </Tooltip>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            color={'highlight'}
            data-testid={concatTestId(setterTestId, 'test-run')}
            icon={
              testRunIcon ? (
                <span
                  style={{
                    fontSize: 14,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {testRunIcon}
                </span>
              ) : (
                <IconCozPlayCircle style={{ fontSize: 14 }} />
              )
            }
            size={'small'}
            onClick={onTestRun}
          >
            {I18n.t('code_node_test_code')}
          </Button>

          <IconButton
            onClick={onClose}
            color={'secondary'}
            size={'small'}
            icon={<IconCozSideCollapse style={{ fontSize: 18 }} />}
            data-testid={concatTestId(setterTestId, 'expand-button')}
          />
        </div>
      </div>
      {children}
    </div>
  );
};
