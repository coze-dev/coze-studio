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

/* eslint no-param-reassign: ["error", { "props": false }] */

import * as path from 'path';
import * as fs from 'fs';
import { parse as protoParse } from 'proto-parser';
import { logAndThrowError } from '../utils';
import {
  type ProtoDocument,
  type ProtoError,
  SyntaxType,
  type MessageDefinition,
  type ServiceDefinition,
  type MethodDefinition,
  type NamespaceBase,
  type NamespaceDefinition,
  type FieldExtensionConfig,
  type ServiceExtensionConfig,
  type FunctionExtensionConfig,
} from './type';

import * as extensionUtil from '../common/extension_util';

export * from './type';

// NOTE: cover old Rules: (api_method) = 'POST'
const oldRuleRegExp =
  /\(api_req\)\.|\(api_resp\)\.|\(api_method\)\.|\(pb_idl\.api_method\)\./;

function extractExtensionConfigFromOption(
  optionKey: string,
  optionValue: string,
) {
  let key = '';

  if (/^\(api\.(.*)\)/.test(optionKey)) {
    key = optionKey.replace(/^\(api\.(.*)\)/, '$1');
  } else if (oldRuleRegExp.test(optionKey)) {
    key = optionKey.replace(oldRuleRegExp, '');
  } else {
    return false;
  }

  const config = extensionUtil.extractExtensionConfig(key, optionValue);
  return config;
}

function convertFieldOptions(message: MessageDefinition) {
  const { name, fields } = message;

  for (const field of Object.values(fields)) {
    if (field.options && Object.keys(field.options).length > 0) {
      const extensionConfig: FieldExtensionConfig = {};
      const fieldName = field.name;
      const fieldType = field.type;

      for (const key of Object.keys(field.options)) {
        const value = field.options[key];
        const config = extractExtensionConfigFromOption(key, value);

        /* istanbul ignore else */
        if (config) {
          if ('key' in config) {
            // a key which is the same with the field name will make no sense
            if (config.key === fieldName) {
              delete config.key;
            }
          } else if (config.position === 'path') {
            if (
              ['double', 'float', 'bool', 'bytes'].includes(fieldType.value)
            ) {
              const errorMessage = `the type of path parameter '${fieldName}' in '${name}' should be string or integer`;
              logAndThrowError(errorMessage);
            }
          }

          Object.assign(extensionConfig, config);
        }
      }

      field.extensionConfig =
        extensionUtil.filterFieldExtensionConfig(extensionConfig);
    }
  }
}

function convertMethodOptions(method: MethodDefinition) {
  if (!(method.options && Object.keys(method.options).length > 0)) {
    return;
  }

  const extensionConfig: FunctionExtensionConfig = {};

  for (const key of Object.keys(method.options)) {
    const value = method.options[key];
    const config = extractExtensionConfigFromOption(key, value);

    /* istanbul ignore else */
    if (config) {
      Object.assign(extensionConfig, config);
    }
  }

  method.extensionConfig =
    extensionUtil.filterFunctionExtensionConfig(extensionConfig);
}

// NOTE: omit message definitions nested in a service definition
function convertServiceOptions(service: ServiceDefinition) {
  if (service.options && Object.keys(service.options).length > 0) {
    const extensionConfig: ServiceExtensionConfig = {};

    for (const key of Object.keys(service.options)) {
      const value = service.options[key];
      const config = extractExtensionConfigFromOption(key, value);

      /* istanbul ignore else */
      if (config) {
        Object.assign(extensionConfig, config);
      }
    }

    service.extensionConfig =
      extensionUtil.filterServiceExtensionConfig(extensionConfig);
  }

  if (Object.keys(service.methods).length > 0) {
    Object.keys(service.methods).forEach(serviceName => {
      convertMethodOptions(service.methods[serviceName]);
    });
  }
}

function convertNamespace(namespaceBase: NamespaceBase) {
  const { nested } = namespaceBase;

  /* istanbul ignore next */
  if (!(nested && Object.keys(nested).length > 0)) {
    return;
  }

  for (const name of Object.keys(nested)) {
    const nestedStatement = nested[name];
    const { syntaxType } = nestedStatement;

    /* istanbul ignore else */
    if (syntaxType === SyntaxType.ServiceDefinition) {
      convertServiceOptions(nestedStatement as ServiceDefinition);
    } else if (syntaxType === SyntaxType.MessageDefinition) {
      convertFieldOptions(nestedStatement as MessageDefinition);
    } else if (syntaxType === SyntaxType.NamespaceDefinition) {
      convertNamespace(nestedStatement as NamespaceDefinition);
    }
  }
}

export function parse(source: string) {
  let content: string;
  let filePath = 'source';

  if (/\.proto$/.test(source)) {
    filePath = path.resolve(process.cwd(), source);

    if (!fs.existsSync(filePath)) {
      const message = `no such file: ${filePath}`;
      logAndThrowError(message);
    }

    content = fs.readFileSync(filePath, 'utf8');
  } else {
    content = source;
  }

  const document: ProtoDocument | ProtoError = protoParse(content);

  if ((document as ProtoError).syntaxType === SyntaxType.ProtoError) {
    const { line, message } = document as ProtoError;
    const fullMessage = `${message}(${filePath}:${line}:0)`;
    logAndThrowError(fullMessage);
  }

  convertNamespace((document as ProtoDocument).root);
  return document as ProtoDocument;
}
