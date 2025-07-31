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

/* eslint-disable max-params */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { isNumber } from 'lodash-es';
import {
  type IFormSchema,
  TestFormFieldName,
} from '@coze-workflow/test-run-next';
import { ViewVariableType } from '@coze-workflow/base';
import regexpDecorator from '@coze-editor/extension-regexp-decorator';
import jsonUnnecessaryProperties from '@coze-editor/extension-json-unnecessary-properties';
import jsonHover from '@coze-editor/extension-json-hover';
import jsonEmptyStringValueCompletion from '@coze-editor/extension-json-empty-string-value-completion';
import { I18n } from '@coze-arch/i18n';
import { Typography, Tag } from '@coze-arch/coze-design';
import { Decoration } from '@codemirror/view';

import { VoiceWidget } from './voice-widget';
import { renderDom } from './render-dom';
import { FileWidget } from './file-widget';
import { UploadButton, VoiceButton } from './completion';

import css from './key-hover.module.less';

interface KeyHoverPopoverValue {
  title?: string;
  required?: boolean;
  tag?: string;
  description?: string;
}

const generateHoverMap = (properties: IFormSchema['properties']) => {
  const map = {};
  const GROUP_MAP: Record<string, KeyHoverPopoverValue> = {
    [TestFormFieldName.Input]: {
      title: I18n.t('wf_testrun_form_json_group_input'),
      description: I18n.t('wf_testrun_form_json_group_input_extra'),
    },
    [TestFormFieldName.Batch]: {
      title: I18n.t('wf_testrun_form_json_group_batch'),
      description: I18n.t('wf_testrun_form_json_group_batch_extra'),
    },
    [TestFormFieldName.Setting]: {
      title: I18n.t('wf_testrun_form_json_group_settings'),
      description: I18n.t('wf_testrun_form_json_group_settings_extra'),
    },
  };
  Object.entries(properties || {}).forEach(([groupKey, group]) => {
    map[groupKey] = GROUP_MAP[groupKey];
    Object.entries(group.properties || {}).forEach(([key, field]) => {
      map[`${groupKey}.${key}`] = {
        title: field.title || key,
        description: field.description,
        required: field.required,
        tag: field['x-decorator-props']?.tag,
        type: field['x-origin-type'],
        props: field['x-component-props'],
      };
    });
  });
  return map;
};

const KeyHoverPopover: React.FC<KeyHoverPopoverValue> = ({
  title,
  required,
  tag,
  description,
}) => (
  <div className={css['key-hover']}>
    {title ? (
      <div className={css.label}>
        {
          <Typography.Text size="small" strong>
            {title}
          </Typography.Text>
        }
        {required ? <span className={css.asterisk}>*</span> : null}
        {tag ? (
          <Tag size="mini" color="primary">
            {tag}
          </Tag>
        ) : null}
      </div>
    ) : null}
    {description ? (
      <Typography.Text size="small" type="secondary" style={{ maxWidth: 200 }}>
        {description}
      </Typography.Text>
    ) : null}
  </div>
);

interface GetExtensionsOptions {
  properties: IFormSchema['properties'];
  spaceId: string;
  editorRef: any;
}

export const getExtensions = ({
  properties,
  spaceId,
  editorRef,
}: GetExtensionsOptions) => {
  const map = generateHoverMap(properties);

  return [
    jsonHover({
      key({ paths }) {
        const value = map[paths.join('.')];
        if (!value && paths.length > 2) {
          return undefined;
        }
        return renderDom(
          KeyHoverPopover,
          value ?? {
            description: I18n.t('wf_testrun_form_json_key_hover_no'),
          },
        );
      },
    }),
    jsonUnnecessaryProperties(({ paths }) => {
      if (paths.length > 2) {
        return false;
      }
      return !map[paths.join('.')];
    }),
    regexpDecorator({
      regexp: /<#file:(https?:.+)#>/g,
      decorate(add, from, to, matches) {
        add(
          from,
          to,
          Decoration.replace({
            widget: new FileWidget({ url: matches[1], from, to }),
            atomicRange: true,
            selectable: true,
          }),
        );
      },
    }),
    regexpDecorator({
      regexp: /<#voice:(\d+)#>/g,
      decorate(add, from, to, matches) {
        add(
          from,
          to,
          Decoration.replace({
            widget: new VoiceWidget({
              voiceId: matches[1],
              from,
              to,
            }),
            atomicRange: true,
            selectable: true,
          }),
        );
      },
    }),
    jsonEmptyStringValueCompletion(({ paths, position }) => {
      const key = isNumber(paths[paths.length - 1])
        ? paths.slice(0, -1).join('.')
        : paths.join('.');
      const val = map[key];
      if (val?.type && ViewVariableType.isVoiceType(val.type)) {
        return renderDom(VoiceButton, {
          editorRef,
          position,
          spaceId,
        });
      }
      if (val?.type && ViewVariableType.isFileType(val.type)) {
        return renderDom(UploadButton, {
          editorRef,
          position,
          ...val.props,
        });
      }
    }),
  ] as any[];
};
