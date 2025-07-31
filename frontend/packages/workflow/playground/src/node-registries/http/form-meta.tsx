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

import { get, isString } from 'lodash-es';
import {
  ValidateTrigger,
  type FormMetaV2,
  type Validate,
} from '@flowgram-adapter/free-layout-editor';
import { json, type Text } from '@coze-editor/editor/language-json';
import { I18n } from '@coze-arch/i18n';

import { provideNodeOutputVariablesEffect } from '@/nodes-v2/materials/provide-node-output-variables';
import { nodeMetaValidate } from '@/nodes-v2/materials/node-meta-validate';
import { fireNodeTitleChange } from '@/nodes-v2/materials/fire-node-title-change';
import { createValueExpressionInputValidate } from '@/nodes-v2/materials/create-value-expression-input-validate';
import { createNodeInputNameValidate } from '@/nodes-v2/components/node-input-name/validate';
import { valueExpressionValidator } from '@/form-extensions/validators';

import { BodyType } from './setters/constants';
import { createAuthValidator } from './setters/auth/create-auth-validator';
import FormRender from './form-render';
import { transformOnInit, transformOnSubmit } from './data-transformer';
import { expressionStringValidator } from './components/base-editor/validate';

const urlPathName = 'inputs.apiInfo.url';
const headersPathName = 'inputs.headers.*.name';
const headersInputPathName = 'inputs.headers.*.input';
const paramsPathName = 'inputs.params.*.name';
const paramsInputPathName = 'inputs.params.*.input';
const bodyJsonPathName = 'inputs.body.bodyData.json';
const bodyRawTextPathName = 'inputs.body.bodyData.rawText';
const bodyFormDataPathName = 'inputs.body.bodyData.formData.*.name';
const bodyFormDataInputPathName = 'inputs.body.bodyData.formData.*.input';
const bodyFormURLEncodedPathName = 'inputs.body.bodyData.formURLEncoded.*.name';
const bodyFormURLEncodedInputPathName =
  'inputs.body.bodyData.formURLEncoded.*.input';
const httpNameValidationRule =
  /^(?!.*\b(true|false|and|AND|or|OR|not|NOT|null|nil|If|Switch)\b)[a-zA-Z_][-a-zA-Z_$0-9]*$/;
const httpNameValidationRuleError = I18n.t('node_http_name_rule');

interface Match {
  match: string;
  range: [number, number];
}

export const HTTP_FORM_META: FormMetaV2<FormData> = {
  // Node form rendering
  render: () => <FormRender />,

  // verification trigger timing
  validateTrigger: ValidateTrigger.onBlur,

  // validation rules
  validate: {
    nodeMeta: nodeMetaValidate,
    [urlPathName]: ({ value, context }) => {
      if (isString(value) && value?.length > 10000) {
        return I18n.t('node_http_url_length_limit');
      }
      return expressionStringValidator(value, context, {
        emptyMessage: I18n.t('node_http_url_required'),
        invalidMessage: I18n.t('node_http_url_invalid_var'),
      });
    },
    [headersPathName]: createNodeInputNameValidate({
      getNames: ({ formValues }) =>
        (get(formValues, 'inputs.headers') || []).map(item => item.name),
      validatorConfig: {
        rule: httpNameValidationRule,
        errorMessage: httpNameValidationRuleError,
      },
    }),
    [headersInputPathName]: createValueExpressionInputValidate({
      required: false,
    }),
    [paramsPathName]: createNodeInputNameValidate({
      getNames: ({ formValues }) =>
        (get(formValues, 'inputs.params') || []).map(item => item.name),
      validatorConfig: {
        rule: httpNameValidationRule,
        errorMessage: httpNameValidationRuleError,
      },
    }),
    [paramsInputPathName]: createValueExpressionInputValidate({
      required: false,
    }),
    [bodyJsonPathName]: (async ({ value, formValues, context }) => {
      const bodyType = get(formValues, 'inputs.body.bodyType');
      if (bodyType !== BodyType.Json) {
        return;
      }

      function findAllMatches(inputString: string, regex: RegExp): Match[] {
        const globalRegex = new RegExp(
          regex,
          regex.flags.includes('g') ? regex.flags : `${regex.flags}g`,
        );
        const matches: Match[] = [];
        const matchIterator = inputString.matchAll(globalRegex);
        for (const match of matchIterator) {
          if (match.index === undefined) {
            continue;
          }
          matches.push({
            match: match[0],
            range: [match.index, match.index + match[0].length],
          });
        }

        return matches;
      }

      const transform = (text: Text) => {
        const originalSource = text.toString();
        const matches = findAllMatches(originalSource, /\{\{([^\}]*)\}\}/g);

        if (matches.length > 0) {
          matches.forEach(({ range }) => {
            text.replaceRange(range[0], range[1], 'null');
          });
        }

        return text;
      };

      const jsonErrors = await json.languageService.validate(value ?? '', {
        transform,
      });

      if (jsonErrors.length > 0) {
        return I18n.t('workflow_json_syntax_error', {}, 'JSON 语法错误');
      }

      return expressionStringValidator(value, context, {
        emptyMessage: I18n.t('node_http_json_required'),
        invalidMessage: I18n.t('node_http_json_invalid_var'),
      });
    }) as Validate,
    [bodyRawTextPathName]: ({ value, formValues, context }) => {
      const bodyType = get(formValues, 'inputs.body.bodyType');
      if (bodyType !== BodyType.RawText) {
        return;
      }
      return expressionStringValidator(value, context, {
        required: false,
        emptyMessage: '',
        invalidMessage: I18n.t('node_http_raw_text_invalid_var'),
      });
    },
    [bodyFormDataPathName]: ({ value, formValues, context, name }) => {
      const bodyType = get(formValues, 'inputs.body.bodyType');
      if (bodyType !== BodyType.FormData) {
        return;
      }
      return createNodeInputNameValidate({
        getNames: ({ formValues: curFormValues }) => {
          const formData = get(curFormValues, 'inputs.body.bodyData.formData');
          return formData?.map(item => item.name);
        },
        validatorConfig: {
          rule: httpNameValidationRule,
          errorMessage: httpNameValidationRuleError,
        },
      })({ value, formValues, context, name });
    },
    [bodyFormDataInputPathName]: ({ value, formValues, context }) => {
      const { node, playgroundContext } = context;
      const bodyType = get(formValues, 'inputs.body.bodyType');
      if (bodyType !== BodyType.FormData) {
        return;
      }
      return valueExpressionValidator({
        value,
        playgroundContext,
        node,
        required: false,
      });
    },
    [bodyFormURLEncodedPathName]: ({ value, formValues, context, name }) => {
      const bodyType = get(formValues, 'inputs.body.bodyType');
      if (bodyType !== BodyType.FormUrlEncoded) {
        return;
      }
      return createNodeInputNameValidate({
        getNames: ({ formValues: curFormValues }) => {
          const formURLEncodedData = get(
            curFormValues,
            'inputs.body.bodyData.formURLEncoded',
          );
          return formURLEncodedData?.map(item => item.name);
        },
        validatorConfig: {
          rule: httpNameValidationRule,
          errorMessage: httpNameValidationRuleError,
        },
      })({ value, formValues, context, name });
    },
    [bodyFormURLEncodedInputPathName]: ({ value, formValues, context }) => {
      const { node, playgroundContext } = context;
      const bodyType = get(formValues, 'inputs.body.bodyType');
      if (bodyType !== BodyType.FormUrlEncoded) {
        return;
      }
      return valueExpressionValidator({
        value,
        playgroundContext,
        node,
        required: false,
      });
    },
    ...createAuthValidator(),
  },

  // Side effect management
  effect: {
    nodeMeta: fireNodeTitleChange,
    outputs: provideNodeOutputVariablesEffect,
  },

  // Node Backend Data - > Frontend Form Data
  formatOnInit: transformOnInit,

  // Front-end form data - > node back-end data
  formatOnSubmit: transformOnSubmit,
};
