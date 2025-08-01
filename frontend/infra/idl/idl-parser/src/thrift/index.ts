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
import { parse as thriftParse } from '@lancewuz/thrift-parser';
import { logAndThrowError } from '../utils';
import {
  type ThriftDocument,
  type ThriftErrors,
  SyntaxType,
  type InterfaceWithFields,
  type Annotation,
  type ServiceDefinition,
  type FunctionDefinition,
  type EnumDefinition,
  type FieldExtensionConfig,
  type ServiceExtensionConfig,
  type FunctionExtensionConfig,
  type Comment,
} from './type';
import * as extensionUtil from '../common/extension_util';

// export statements
export * from './type';

// global variables
let reviseTailComment = true;

function extractExtensionConfigFromAnnotation(annotation: Annotation) {
  let key = annotation.name.value;
  const value = (annotation.value && annotation.value.value) || '';

  if (/^((agw\.)|(api\.)|(go\.tag))/.test(key) === false) {
    return false;
  }

  if (/^((agw\.)|(api\.))/.test(key)) {
    key = key.slice(4);
  }

  const config = extensionUtil.extractExtensionConfig(key, value);
  return config;
}

function convertFieldAnnotations(struct: InterfaceWithFields) {
  const name = struct.name.value;
  const { fields } = struct;

  for (const field of fields) {
    if (field.annotations && field.annotations.annotations.length > 0) {
      const extensionConfig: FieldExtensionConfig = {};
      const fieldName = field.name.value;
      const fieldSyntaxType = field.fieldType.type;

      for (const annotation of field.annotations.annotations) {
        const config = extractExtensionConfigFromAnnotation(annotation);
        if (config) {
          if ('key' in config) {
            // a key which is the same with the field name will make no sense
            if (config.key === fieldName) {
              delete config.key;
            }
          } else if (config.position === 'path') {
            if (
              [
                SyntaxType.DoubleKeyword,
                SyntaxType.BoolKeyword,
                SyntaxType.ByteKeyword,
                SyntaxType.ListKeyword,
                SyntaxType.SetKeyword,
                SyntaxType.MapKeyword,
                SyntaxType.VoidKeyword,
              ].includes(fieldSyntaxType)
            ) {
              const message = `the type of path parameter '${fieldName}' in '${name}' should be string or integer`;
              logAndThrowError(message);
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

function convertFunctionAnnotations(func: FunctionDefinition) {
  const { annotations } = func;

  if (!(annotations && annotations.annotations.length > 0)) {
    return;
  }

  const extensionConfig: FunctionExtensionConfig = {};

  for (const annotation of annotations.annotations) {
    const config = extractExtensionConfigFromAnnotation(annotation);

    /* istanbul ignore next */
    if (config) {
      Object.assign(extensionConfig, config);
    }
  }

  func.extensionConfig =
    extensionUtil.filterFunctionExtensionConfig(extensionConfig);
}

function convertServiceAnnotations(service: ServiceDefinition) {
  const { annotations } = service;

  if (annotations && annotations.annotations.length > 0) {
    const extensionConfig: ServiceExtensionConfig = {};

    for (const annotation of annotations.annotations) {
      const config = extractExtensionConfigFromAnnotation(annotation);

      /* istanbul ignore else */
      if (config) {
        Object.assign(extensionConfig, config);
      }
    }

    service.extensionConfig =
      extensionUtil.filterServiceExtensionConfig(extensionConfig);
  }

  if (service.functions.length > 0) {
    service.functions.forEach(func => {
      convertFunctionAnnotations(func);
    });
  }
}

function reviseFieldComments(struct: InterfaceWithFields) {
  const { fields } = struct;

  /* istanbul ignore next */
  if (fields.length < 2) {
    return;
  }

  for (let i = fields.length - 1; i > 0; i--) {
    const currentField = fields[i];
    const prevField = fields[i - 1];
    const prevFieldEndLine = prevField.loc.end.line;
    const prevFieldComments = prevField.comments;

    for (let j = 0; j < prevFieldComments.length; j++) {
      if (prevFieldComments[j].loc.end.line > prevFieldEndLine) {
        const dislocatedComments = prevFieldComments.splice(
          j,
          prevFieldComments.length - j,
        );
        currentField.comments = [
          ...dislocatedComments,
          ...currentField.comments,
        ];
        break;
      }
    }
  }
}

function reviseEnumMemberComments(enm: EnumDefinition) {
  const { members } = enm;

  /* istanbul ignore next */
  if (members.length < 2) {
    return;
  }

  for (let i = 0; i < members.length - 1; i++) {
    const currentMember = members[i];
    const nextMember = members[i + 1];
    const currentMemberEndLine = currentMember.loc.end.line;
    const nextMemberFirstComment = nextMember.comments[0];

    if (
      nextMemberFirstComment &&
      nextMemberFirstComment.loc.end.line === currentMemberEndLine
    ) {
      const dislocatedComment = nextMember.comments.shift() as Comment;
      currentMember.comments.push(dislocatedComment);
    }
  }
}

function reviseFunctionComments(service: ServiceDefinition) {
  const { functions } = service;
  if (functions.length < 2) {
    return;
  }

  for (let i = 0; i < functions.length - 1; i++) {
    const currentFunction = functions[i];
    const nextFunction = functions[i + 1];
    const currentFunctionEndLine = currentFunction.loc.end.line;
    const nextFunctionFirstComment = nextFunction.comments[0];

    if (
      nextFunctionFirstComment &&
      nextFunctionFirstComment.loc.end.line === currentFunctionEndLine
    ) {
      const dislocatedComment = nextFunction.comments.shift() as Comment;
      currentFunction.comments.push(dislocatedComment);
    }
  }
}

export interface ParseOption {
  reviseTailComment?: boolean;
}

const defualtParseOption = {
  reviseTailComment: true,
};

export function parse(source: string, option?: ParseOption): ThriftDocument {
  let content: string;
  let filePath = 'source';

  if (/\.thrift$/.test(source)) {
    filePath = path.resolve(process.cwd(), source);

    if (!fs.existsSync(filePath)) {
      const message = `no such file: ${filePath}`;
      logAndThrowError(message);
    }

    content = fs.readFileSync(filePath, 'utf8');
  } else {
    content = source;
  }

  const document: ThriftDocument | ThriftErrors = thriftParse(content);

  if ((document as ThriftErrors).type === SyntaxType.ThriftErrors) {
    const error = (document as ThriftErrors).errors[0];
    const { start } = error.loc;
    const message = `${error.message}(${filePath}:${start.line}:${start.column})`;
    logAndThrowError(message);
  }

  const parseOption = { ...defualtParseOption, ...option };
  reviseTailComment = parseOption.reviseTailComment;

  for (const statement of (document as ThriftDocument).body) {
    /* istanbul ignore else */
    if (
      [SyntaxType.StructDefinition, SyntaxType.UnionDefinition].includes(
        statement.type,
      )
    ) {
      convertFieldAnnotations(statement as InterfaceWithFields);

      if (reviseTailComment) {
        reviseFieldComments(statement as InterfaceWithFields);
      }
    } else if (statement.type === SyntaxType.ServiceDefinition) {
      convertServiceAnnotations(statement);

      if (reviseTailComment) {
        reviseFunctionComments(statement);
      }
    } else if (statement.type === SyntaxType.EnumDefinition) {
      /* istanbul ignore else */
      if (reviseTailComment) {
        reviseEnumMemberComments(statement);
      }
    }
  }

  return document as ThriftDocument;
}
