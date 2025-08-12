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

import React, { useRef, useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozWarningCircleFill } from '@coze-arch/coze-design/icons';
import { Modal } from '@coze-arch/coze-design';

import { Layout } from '../layout';
import { type EditorProps, type LanguageType } from '../../interface';
import { Editor } from './editor';

export const BizEditor = (props: EditorProps) => {
  const editorApi = useRef<undefined | { getValue?: () => string }>(undefined);

  const [language, setLanguage] = useState<LanguageType>(props.defaultLanguage);
  const [content, setContent] = useState<string | undefined>(
    props.defaultContent,
  );

  const handleLanguageChange = (value: LanguageType) => {
    const langTemplate = props.languageTemplates?.find(
      e => e.language === value,
    );

    const preLangTemplate = props.languageTemplates?.find(
      e => e.language === language,
    );

    if (preLangTemplate?.template === editorApi.current?.getValue?.()) {
      setLanguage(value);
      setContent(langTemplate?.template);
      props.onChange?.(langTemplate?.template || '', value);
      return;
    }

    Modal.warning({
      icon: (
        <IconCozWarningCircleFill
          style={{ color: 'rgba(var(--coze-yellow-5), 1)' }}
        />
      ),
      title: I18n.t('code_node_switch_language'),
      content: I18n.t('code_node_switch_language_description'),
      okType: 'warning',
      okText: I18n.t('Confirm'),
      cancelText: I18n.t('Cancel'),
      closable: true,
      width: 448,
      height: 160,
      onOk: () => {
        setLanguage(value);
        setContent(langTemplate?.template);
        props.onChange?.(langTemplate?.template || '', value);
      },
    });
  };

  return (
    <>
      <Layout
        {...props}
        language={language}
        onLanguageSelect={handleLanguageChange}
      >
        <Editor
          {...props}
          defaultContent={content}
          language={language}
          didMount={api => {
            editorApi.current = api;
          }}
        />
      </Layout>
    </>
  );
};
