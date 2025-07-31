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

/* eslint no-param-reassign: ["error", { "props": false }], import/prefer-default-export: off */
import * as path from 'path';
import * as fs from 'fs';

import * as t from '@lancewuz/thrift-parser';

import { logAndThrowError, getPosixPath } from '../utils';
import * as extensionUtil from '../common/extension_util';
import { convertIntToString } from './util';
import {
  SyntaxType,
  type Annotation,
  type ServiceDefinition,
  type FunctionDefinition,
  type EnumDefinition,
  type ExtensionConfig,
  type FieldExtensionConfig,
  type ServiceExtensionConfig,
  type FunctionExtensionConfig,
  type Comment,
  type Identifier,
  type ContainerType,
  type MapType,
  type StructDefinition,
  type TypedefDefinition,
  type TextLocation,
  type FunctionType,
  type FieldType,
  type UnifyStatement,
  type Annotations,
  type EnumMember,
  type UnifyDocument,
  type FieldDefinition,
  type ConstDefinition,
  type ConstValue,
} from './type';

// cache parsed document
const fileDocumentMap: Record<string, t.ThriftDocument> = {};
const namespaceDefault = 'root';
let enumNames: string[] = [];
let cache = true;
let absoluteFileContentMap: Record<string, string> | undefined;
let rootDir = '';
let entryLooseAbsoluteFilePath = '';
let ignoreGoTag = false;
let ignoreGoTagDash = false;
let addNamespaceValue: ((fieldType: FunctionType) => void) | undefined;
let searchPaths: string[] = [];

const mergeConfig = (
  config: Partial<ExtensionConfig>,
  config2: Partial<ExtensionConfig>,
): ExtensionConfig => {
  const mergedTags: string[] = [];
  if (config?.tag) {
    mergedTags.push(config.tag);
  }
  if (config2?.tag) {
    mergedTags.push(config2.tag);
  }
  const res = Object.assign(config, config2);
  if (mergedTags.length > 0) {
    res.tag = mergedTags.join(',');
  }
  return res;
};

function extractExtensionConfigFromAnnotation(
  annotation: Annotation,
): false | ExtensionConfig {
  let key = annotation.name.value;
  const value = (annotation.value && annotation.value.value) || '';

  if (/^((agw\.)|(api\.)|(go\.tag))/.test(key) === false) {
    return false;
  }

  if (/^((agw\.)|(api\.))/.test(key)) {
    key = key.slice(4);
  }

  const config = extensionUtil.extractExtensionConfig(key, value, ignoreGoTag);
  return config;
}

function getFieldExtensionConfig(
  fieldName: string,
  fieldType: FunctionType,
  annotations?: Annotations,
): FieldExtensionConfig {
  if (!annotations) {
    return {};
  }

  const extensionConfig: FieldExtensionConfig = {};
  for (const annotation of annotations.annotations) {
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
          ].includes(fieldType.type)
        ) {
          const fullFilePath = path.resolve(
            rootDir,
            `${entryLooseAbsoluteFilePath}.proto`,
          );
          const message = `path parameter '${fieldName}' should be string or integer`;
          const fullMessage = `${message} (${fullFilePath})`;
          logAndThrowError(fullMessage, message);
        }
      }

      mergeConfig(extensionConfig, config);
    }
  }

  const res = extensionUtil.filterFieldExtensionConfig(extensionConfig);
  return res;
}

function getFuncExtensionConfig(
  annotations?: Annotations,
): FunctionExtensionConfig {
  if (!annotations) {
    return {};
  }

  const extensionConfig: FunctionExtensionConfig = {};
  for (const annotation of annotations.annotations) {
    const config = extractExtensionConfigFromAnnotation(annotation);

    /* istanbul ignore next */
    if (config) {
      Object.assign(extensionConfig, config);
    }
  }

  return extensionUtil.filterFunctionExtensionConfig(extensionConfig);
}

function getServiceExtensionConfig(
  annotations?: Annotations,
): ServiceExtensionConfig {
  if (!annotations) {
    return {};
  }

  const extensionConfig: ServiceExtensionConfig = {};
  for (const annotation of annotations.annotations) {
    const config = extractExtensionConfigFromAnnotation(annotation);

    /* istanbul ignore else */
    if (config) {
      Object.assign(extensionConfig, config);
    }
  }

  return extensionUtil.filterServiceExtensionConfig(extensionConfig);
}

function reviseFieldComments(fields: (FieldDefinition | EnumMember)[]): void {
  /* istanbul ignore next */
  if (fields.length < 2) {
    return;
  }

  // move previous comments to current field
  for (let i = fields.length - 1; i > 0; i--) {
    const currentField = fields[i];
    const prevField = fields[i - 1];
    const prevFieldEndLine = (prevField.loc as TextLocation).end.line;
    const prevFieldComments = prevField.comments;

    for (let j = 0; j < prevFieldComments.length; j++) {
      if (
        (prevFieldComments[j].loc as TextLocation).end.line > prevFieldEndLine
      ) {
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

  // move next comments to current field
  for (let i = 0; i < fields.length - 1; i++) {
    const currentField = fields[i];
    const nextField = fields[i + 1];
    const currentFieldEndLine = (currentField.loc as TextLocation).end.line;
    const nextFieldFirstComment = nextField.comments[0];

    if (
      nextFieldFirstComment &&
      (nextFieldFirstComment.loc as TextLocation).end.line ===
        currentFieldEndLine
    ) {
      const dislocatedComment = nextField.comments.shift() as Comment;
      currentField.comments.push(dislocatedComment);
    }
  }
}

function reviseFuncComments(functions: FunctionDefinition[]): void {
  if (functions.length < 2) {
    return;
  }

  for (let i = 0; i < functions.length - 1; i++) {
    const currentFunc = functions[i];
    const nextFunc = functions[i + 1];
    const currentFuncEndLine = (currentFunc.loc as TextLocation).end.line;
    const nextFuncFirstComment = nextFunc.comments[0];

    if (
      nextFuncFirstComment &&
      (nextFuncFirstComment.loc as TextLocation).end.line === currentFuncEndLine
    ) {
      const dislocatedComment = nextFunc.comments.shift() as Comment;
      currentFunc.comments.push(dislocatedComment);
    }
  }
}

function getUnifyNamespace(
  looseAbsoluteFilePath: string,
  astNamespaces?: t.NamespaceDefinition[],
): {
  namespace: string;
  unifyNamespace: string;
} {
  let namespace = '';
  let unifyNamespace = '';
  if (astNamespaces && astNamespaces.length > 0) {
    const namespaceMap: Record<string, t.NamespaceDefinition> = {};
    for (const astNamespace of astNamespaces) {
      const scopeName = astNamespace.scope.value;
      namespaceMap[scopeName] = astNamespace;
    }

    const astNamespaceCurrent =
      namespaceMap.js || namespaceMap.go || namespaceMap.py;
    if (astNamespaceCurrent) {
      namespace = astNamespaceCurrent.name.value;
      unifyNamespace = namespace;
    } else if (namespaceMap.java) {
      namespace = namespaceMap.java.name.value.split('.').pop() as string;
      unifyNamespace = namespace;
    } else {
      const message = 'a js namespace should be specifed';
      const fullFilePath = path.resolve(
        rootDir,
        `${looseAbsoluteFilePath}.thrift`,
      );
      const infoMessage = `${message} (${fullFilePath})`;
      logAndThrowError(infoMessage, message);
    }
  } else {
    namespace = '';
    unifyNamespace = namespaceDefault;
  }

  unifyNamespace = unifyNamespace
    .replace(/\./g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '');

  return { namespace, unifyNamespace };
}

function createAddNamespaceReferValue(
  filenameNamespaceMap: Record<string, string>,
  namespace: string,
): (fieldType: FunctionType) => void {
  const regExpNamespaceMap = new Map<RegExp, string>();
  Object.keys(filenameNamespaceMap).forEach(filename => {
    const regExp = new RegExp(`^${filename}(\\.[^\\.]*)$`);
    regExpNamespaceMap.set(regExp, filenameNamespaceMap[filename]);
  });

  function addNamespaceReferValue(fieldType: FunctionType): void {
    if ((fieldType as Identifier).type === SyntaxType.Identifier) {
      const identifierValue = (fieldType as Identifier).value;

      if (!identifierValue.includes('.')) {
        (
          fieldType as Identifier
        ).namespaceValue = `${namespace}.${identifierValue}`;
      } else {
        const parts = identifierValue.split('.');
        if (parts.length === 2 && enumNames.includes(parts[0])) {
          (
            fieldType as Identifier
          ).namespaceValue = `${namespace}.${identifierValue}`;
        } else {
          for (const regExp of regExpNamespaceMap.keys()) {
            if (regExp.test(identifierValue)) {
              const namespaceName = regExpNamespaceMap.get(regExp);
              (fieldType as Identifier).namespaceValue =
                identifierValue.replace(regExp, `${namespaceName}$1`);
              break;
            }
          }
        }
      }
    } else if ((fieldType as ContainerType).valueType) {
      addNamespaceReferValue(
        (fieldType as ContainerType).valueType as FunctionType,
      );

      if ((fieldType as MapType).keyType) {
        addNamespaceReferValue((fieldType as MapType).keyType as FunctionType);
      }
    }
  }

  return addNamespaceReferValue;
}

function getAddNamespaceReferValue(
  astIncludes: t.IncludeDefinition[],
  namespace: string,
): ((fieldType: FunctionType) => void) | undefined {
  const filenameNamespaceMap: Record<string, string> = {};

  for (const astInclude of astIncludes) {
    const idlFilePath = astInclude.path.value;
    const looseIdlFilePath = idlFilePath.replace(/\.thrift$/, '');
    const looseFilename = looseIdlFilePath.split('/').pop() as string;
    // try relative path
    let looseAbsoluteFilePath = getPosixPath(
      path.join(path.dirname(entryLooseAbsoluteFilePath), looseIdlFilePath),
    );

    // try absulote path
    const alternativeLooseAbsoluteFilePath = looseIdlFilePath;

    let document =
      fileDocumentMap[looseAbsoluteFilePath] ||
      fileDocumentMap[alternativeLooseAbsoluteFilePath];
    if (!document) {
      let content = '';
      if (absoluteFileContentMap) {
        content = absoluteFileContentMap[`${looseAbsoluteFilePath}.thrift`];
        if (typeof content === 'undefined') {
          content =
            absoluteFileContentMap[
              `${alternativeLooseAbsoluteFilePath}.thrift`
            ];
          if (typeof content === 'undefined') {
            logAndThrowError(
              `file ${looseAbsoluteFilePath}.thrift does not exist in fileContentMap`,
            );
          }

          looseAbsoluteFilePath = alternativeLooseAbsoluteFilePath;
        }
      } else {
        let fullFilePath = getPosixPath(
          path.resolve(rootDir, `${looseAbsoluteFilePath}.thrift`),
        );

        // Search
        if (!fs.existsSync(fullFilePath)) {
          const filePaths = [rootDir, ...searchPaths].map(searchPath =>
            getPosixPath(
              path.resolve(
                rootDir,
                searchPath,
                `${alternativeLooseAbsoluteFilePath}.thrift`,
              ),
            ),
          );

          const existedFilePath = filePaths.find(filePath =>
            fs.existsSync(filePath),
          );
          if (typeof existedFilePath === 'undefined') {
            logAndThrowError(`file ${filePaths[0]} does not exist`);
          } else {
            fullFilePath = existedFilePath;
            looseAbsoluteFilePath = path
              .relative(rootDir, existedFilePath)
              .replace(/\.thrift$/, '');
          }
        }

        content = fs.readFileSync(fullFilePath, 'utf8');
      }

      document = parseContent(content, looseAbsoluteFilePath);
    } else if (!fileDocumentMap[looseAbsoluteFilePath]) {
      looseAbsoluteFilePath = alternativeLooseAbsoluteFilePath;
    }

    const astNamespaces: t.NamespaceDefinition[] = [];
    for (const statement of document.body) {
      if (statement.type === t.SyntaxType.NamespaceDefinition) {
        astNamespaces.push(statement as t.NamespaceDefinition);
      }
    }

    const { unifyNamespace } = getUnifyNamespace(
      looseAbsoluteFilePath,
      astNamespaces,
    );
    filenameNamespaceMap[looseFilename] = unifyNamespace;
  }

  return createAddNamespaceReferValue(filenameNamespaceMap, namespace);
}

function convertTypedefDefinition(
  astTypedef: TypedefDefinition,
): TypedefDefinition {
  const typedefDefinition: TypedefDefinition = { ...astTypedef };
  // const { name, definitionType} = typedefDefinition
  if (typeof addNamespaceValue === 'function') {
    addNamespaceValue(typedefDefinition.definitionType);
    addNamespaceValue(typedefDefinition.name);
  }

  return typedefDefinition;
}

function addNamespaceValueToConstValue(constValue: ConstValue) {
  if (typeof addNamespaceValue === 'function') {
    if (constValue.type === SyntaxType.Identifier) {
      addNamespaceValue(constValue);
    } else if (constValue.type === SyntaxType.ConstMap) {
      for (const property of constValue.properties) {
        addNamespaceValueToConstValue(property.name);
        addNamespaceValueToConstValue(property.initializer);
      }
    } else if (constValue.type === SyntaxType.ConstList) {
      for (const element of constValue.elements) {
        addNamespaceValueToConstValue(element);
      }
    }
  }
}

function convertConstDefinition(astConst: ConstDefinition): ConstDefinition {
  const constDefinition: ConstDefinition = { ...astConst };
  if (typeof addNamespaceValue === 'function') {
    addNamespaceValue(constDefinition.name);
    addNamespaceValue(constDefinition.fieldType);
    addNamespaceValueToConstValue(constDefinition.initializer);
  }

  return constDefinition;
}

function convertStructDefinition(
  astStruct: StructDefinition,
): StructDefinition {
  const structDefinition: StructDefinition = { ...astStruct };
  const { name, fields } = structDefinition;
  const newName = name;
  if (addNamespaceValue) {
    addNamespaceValue(newName);
  }

  for (const field of fields) {
    const { fieldType, annotations } = field;
    const fieldName = field.name.value;
    if (addNamespaceValue) {
      addNamespaceValue(fieldType);
    }

    field.extensionConfig = getFieldExtensionConfig(
      fieldName,
      fieldType,
      annotations,
    );

    if ((field.extensionConfig.tag || '').includes('omitempty')) {
      field.requiredness = 'optional';
    }
  }

  reviseFieldComments(fields);
  const newFields: FieldDefinition[] = [];
  for (const field of fields) {
    const tag = (field.extensionConfig && field.extensionConfig.tag) || '';
    if (tag.includes('int2str')) {
      field.fieldType = convertIntToString(field.fieldType as FieldType);
    }

    if (ignoreGoTagDash || !tag.includes('ignore')) {
      newFields.push(field);
    }
  }

  structDefinition.fields = newFields;
  structDefinition.name = newName;
  return structDefinition;
}

function convertEnumDefinition(astEnum: EnumDefinition): EnumDefinition {
  const enumDefinition: EnumDefinition = { ...astEnum };
  const { name, members } = enumDefinition;
  enumNames.push(name.value);
  reviseFieldComments(members);
  if (addNamespaceValue) {
    addNamespaceValue(name);
  }

  return enumDefinition;
}

function convertFunctionDefinition(
  astFunc: FunctionDefinition,
): FunctionDefinition {
  const functionDefinition: FunctionDefinition = { ...astFunc };
  const { returnType, fields, annotations, name } = functionDefinition;

  if (addNamespaceValue) {
    addNamespaceValue(name);
    addNamespaceValue(returnType);
    for (const field of fields) {
      addNamespaceValue(field.fieldType);
    }
  }

  functionDefinition.extensionConfig = getFuncExtensionConfig(annotations);
  return functionDefinition;
}

function convertServiceDefinition(
  astService: ServiceDefinition,
): ServiceDefinition {
  const serviceDefinition: ServiceDefinition = { ...astService };
  const { annotations, name } = serviceDefinition;
  const functions: FunctionDefinition[] = [];
  for (const astFunc of astService.functions) {
    functions.push(convertFunctionDefinition(astFunc));
  }

  if (addNamespaceValue) {
    addNamespaceValue(name);
  }

  reviseFuncComments(functions);
  serviceDefinition.functions = functions;
  serviceDefinition.extensionConfig = getServiceExtensionConfig(annotations);
  return serviceDefinition;
}

function parseContent(
  content: string,
  looseAbsoluteFilePath: string,
): t.ThriftDocument {
  if (fileDocumentMap[looseAbsoluteFilePath]) {
    return fileDocumentMap[looseAbsoluteFilePath];
  }

  const document: t.ThriftDocument | t.ThriftErrors = t.parse(content);
  if ((document as t.ThriftErrors).type === t.SyntaxType.ThriftErrors) {
    const error = (document as t.ThriftErrors).errors[0];
    const { start } = error.loc;
    const fullFilePath = path.resolve(
      rootDir,
      `${looseAbsoluteFilePath}.thrift`,
    );
    const message = `${error.message}(${fullFilePath}:${start.line}:${start.column})`;
    logAndThrowError(message, error.message);
  }

  if (cache) {
    fileDocumentMap[looseAbsoluteFilePath] = document as t.ThriftDocument;
  }

  return document as t.ThriftDocument;
}

export function parseThriftContent(
  content: string,
  option: {
    loosePath: string;
    rootDir: string;
    cache: boolean;
    searchPaths: string[];
    namespaceRefer: boolean;
    ignoreGoTag: boolean;
    ignoreGoTagDash: boolean;
  },
  fileContentMap?: Record<string, string>,
): UnifyDocument {
  rootDir = option.rootDir;
  entryLooseAbsoluteFilePath = option.loosePath;
  cache = option.cache;
  ignoreGoTag = option.ignoreGoTag;
  ignoreGoTagDash = option.ignoreGoTagDash;
  searchPaths = option.searchPaths;
  absoluteFileContentMap = fileContentMap;
  addNamespaceValue = undefined;
  enumNames = [];

  // parse file content
  const document = parseContent(content, entryLooseAbsoluteFilePath);
  const statementGroup: Record<string, t.ThriftStatement[]> = {};
  for (const statement of (document as t.ThriftDocument).body) {
    let { type } = statement;

    // NOTE: in the latest version of Thrift, union is similar to struct except that all fields are converted to 'optional'.
    // the idl parse shields the difference, so we can dispose them together.
    if (type === t.SyntaxType.UnionDefinition) {
      type = t.SyntaxType.StructDefinition;
      statement.type = t.SyntaxType.StructDefinition;
    }

    if (!statementGroup[type]) {
      statementGroup[type] = [statement];
    } else {
      statementGroup[type].push(statement);
    }
  }

  const { unifyNamespace, namespace } = getUnifyNamespace(
    entryLooseAbsoluteFilePath,
    statementGroup[t.SyntaxType.NamespaceDefinition] as t.NamespaceDefinition[],
  );
  if (option.namespaceRefer) {
    addNamespaceValue = getAddNamespaceReferValue(
      (statementGroup[t.SyntaxType.IncludeDefinition] ||
        []) as t.IncludeDefinition[],
      unifyNamespace,
    );
  }

  const statements: UnifyStatement[] = [];
  if (statementGroup[t.SyntaxType.TypedefDefinition]) {
    for (const astTypedef of statementGroup[t.SyntaxType.TypedefDefinition]) {
      statements.push(convertTypedefDefinition(astTypedef as any));
    }
  }

  if (statementGroup[SyntaxType.EnumDefinition]) {
    for (const astEnum of statementGroup[t.SyntaxType.EnumDefinition]) {
      statements.push(convertEnumDefinition(astEnum as any));
    }
  }

  if (statementGroup[t.SyntaxType.ConstDefinition]) {
    for (const astConst of statementGroup[t.SyntaxType.ConstDefinition]) {
      statements.push(convertConstDefinition(astConst as any));
    }
  }

  if (statementGroup[SyntaxType.StructDefinition]) {
    for (const astStruct of statementGroup[t.SyntaxType.StructDefinition]) {
      statements.push(convertStructDefinition(astStruct as any));
    }
  }

  if (statementGroup[SyntaxType.ServiceDefinition]) {
    for (const astService of statementGroup[t.SyntaxType.ServiceDefinition]) {
      statements.push(convertServiceDefinition(astService as any));
    }
  }

  const includes: string[] = [];
  if (statementGroup[t.SyntaxType.IncludeDefinition]) {
    for (const astInclude of statementGroup[t.SyntaxType.IncludeDefinition]) {
      includes.push((astInclude as t.IncludeDefinition).path.value);
    }
  }

  const unifyDocument: UnifyDocument = {
    type: SyntaxType.UnifyDocument,
    namespace,
    unifyNamespace,
    includes,
    statements,
    includeRefer: {},
  };

  return unifyDocument;
}
