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

import md5 from 'md5';
import { get } from 'lodash-es';
import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';
import {
  DEFAULT_NODE_META_PATH,
  type FormNodeMeta,
} from '@coze-workflow/nodes';
import { I18n } from '@coze-arch/i18n';

import { generateParametersToProperties } from '@/test-run-kit';
import { type NodeTestMeta, type WorkflowNodeEntity } from '@/test-run-kit';

import { AuthType, BodyType } from './setters/constants';
import { getVariableInfoFromExpression } from './components/variable-support/utils';

const generateExpressionString = (
  expressionStr,
  {
    node,
    /**
     * Label prefix for form display
     */
    labelPrefix = '',
    /**
     * Name prefix, used to distinguish variables
     */
    namePrefix = '',
  }: {
    node: WorkflowNodeEntity;
    labelPrefix?: string;
    namePrefix?: string;
  },
) => {
  if (!expressionStr) {
    return {};
  }
  const doubleBracedPattern = /{{([^}]+)}}/g;
  const matches = expressionStr.match(doubleBracedPattern);
  // Remove {{}} from string
  const matchesContent = matches?.map((varStr: string) =>
    varStr.replace(/^{{|}}$/g, ''),
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parameters: any[] = [];
  const cache: Record<string, boolean> = {};

  matchesContent?.forEach((varStr: string) => {
    const { nodeNameWithDot, fieldPart, fieldKeyPath } =
      getVariableInfoFromExpression(varStr);

    // case:__body_bodyData_rawText + md5("block_out_100001.input.field")
    const fieldName = namePrefix + md5(nodeNameWithDot + fieldPart);
    const workflowVariable =
      node.context.variableService.getWorkflowVariableByKeyPath(fieldKeyPath, {
        node,
      });
    // Duplicate variables are displayed only once
    if (
      !cache[fieldName] &&
      workflowVariable &&
      !workflowVariable.globalVariableKey
    ) {
      cache[fieldName] = true;
      const variableNode: WorkflowNodeEntity = workflowVariable?.node;
      const variableNodeTitle = variableNode
        ? variableNode
            .getData<FlowNodeFormData>(FlowNodeFormData)
            .formModel.getFormItemValueByPath<FormNodeMeta>(
              DEFAULT_NODE_META_PATH,
            )?.title
        : '';
      parameters.push({
        title: [labelPrefix, variableNodeTitle, fieldPart]
          .filter(Boolean)
          .join('-'),
        name: fieldName,
        required: true,
        input: {
          type: 'ref',
          content: {
            keyPath: fieldKeyPath,
          },
        },
      });
    }
  });

  return generateParametersToProperties(parameters, { node });
};

const generateAuth = (node: WorkflowNodeEntity) => {
  const formData = node
    .getData(FlowNodeFormData)
    .formModel.getFormItemValueByPath('/');
  const isAuthOpen = formData?.inputs?.auth?.authOpen;
  const authType = formData?.inputs?.auth?.authType;
  if (!isAuthOpen || !authType) {
    return {};
  }
  const authDataPathMap = {
    [AuthType.BasicAuth]: 'auth.authData.basicAuthData',
    [AuthType.Bearer]: 'auth.authData.bearerTokenData',
    [AuthType.Custom]: 'auth.authData.customData.data',
  };
  const pathStr = authDataPathMap[authType].split('.').join('_');
  const parameters = (
    get(formData.inputs, authDataPathMap[authType]) || []
  ).map(i => ({
    ...i,
    name: `__${pathStr}_${i.name}`,
    title: `${I18n.t('node_http_auth')}-${i.name}`,
  }));
  return generateParametersToProperties(parameters, { node });
};

const generateBody = (node: WorkflowNodeEntity) => {
  const formData = node
    .getData(FlowNodeFormData)
    .formModel.getFormItemValueByPath('/');
  const bodyType = formData?.inputs?.body?.bodyType;
  const bodyDataPathMap = {
    [BodyType.Binary]: 'body.bodyData.binary',
    [BodyType.FormData]: 'body.bodyData.formData',
    [BodyType.FormUrlEncoded]: 'body.bodyData.formURLEncoded',
    [BodyType.Json]: 'body.bodyData.json',
    [BodyType.RawText]: 'body.bodyData.rawText',
  };
  const dataPath = bodyDataPathMap[bodyType];
  const parameters = get(formData.inputs, dataPath);
  if (bodyType === BodyType.FormUrlEncoded || bodyType === BodyType.FormData) {
    const prefixName =
      bodyType === BodyType.FormUrlEncoded ? 'formUrlEncoded' : 'formData';
    const pathStr = dataPath.split('.').join('_');
    return generateParametersToProperties(
      parameters.map(i => ({
        ...i,
        name: `__${pathStr}_${md5(i.name as string)}`,
        title: `${prefixName}-${i.name}`,
      })),
      { node },
    );
  } else if (bodyType === BodyType.Json || bodyType === BodyType.RawText) {
    return generateExpressionString(parameters, {
      node,
      labelPrefix: I18n.t('node_http_body'),
      namePrefix: `__${dataPath.replaceAll('.', '_')}_`,
    });
  } else if (bodyType === BodyType.Binary) {
    return generateParametersToProperties(
      [
        {
          name: `__${dataPath.replaceAll('.', '_')}_fileURL`,
          title: `${I18n.t('node_http_body')}-${I18n.t(
            'node_http_body_binary',
          )}`,
          input: parameters?.fileURL,
        },
      ],
      { node },
    );
  }
  return {};
};

export const test: NodeTestMeta = {
  generateFormInputProperties(node) {
    const formData = node
      .getData(FlowNodeFormData)
      .formModel.getFormItemValueByPath('/');
    const url = formData.inputs?.apiInfo?.url;
    const params = formData?.inputs?.params || [];
    const headers = formData?.inputs?.headers || [];
    return {
      ...generateExpressionString(url, {
        node,
        labelPrefix: I18n.t('node_http_api'),
        namePrefix: '__apiInfo_url_',
      }),
      ...generateParametersToProperties(
        params.map(i => ({
          ...i,
          name: `__params_${md5(i.name as string)}`,
          title: `${I18n.t('node_http_request_params')}-${i.name}`,
        })),
        { node },
      ),
      ...generateParametersToProperties(
        headers.map(i => ({
          ...i,
          name: `__headers_${md5(i.name as string)}`,
          title: `${I18n.t('node_http_headers')}-${i.name}`,
        })),
        { node },
      ),
      ...generateAuth(node),
      ...generateBody(node),
    };
  },
};
