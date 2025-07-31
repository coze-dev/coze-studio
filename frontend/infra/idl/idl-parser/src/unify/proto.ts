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

/* eslint import/prefer-default-export: off */
import * as path from 'path';
import * as fs from 'fs';

import * as t from 'proto-parser';

import { getPosixPath, logAndThrowError } from '../utils';
import * as extensionUtil from '../common/extension_util';
import { convertIntToString } from './util';
import {
  type FieldExtensionConfig,
  type ServiceExtensionConfig,
  type FunctionExtensionConfig,
  type ExtensionConfig,
  type Identifier,
  SyntaxType,
  type StructDefinition,
  type UnifyStatement,
  type UnifyDocument,
  type FieldID,
  type FieldRequired,
  type FieldType,
  type BaseType,
  type KeywordType,
  type ListType,
  type MapType,
  type FieldDefinition,
  type CommentBlock,
  type EnumDefinition,
  type EnumMember,
  type IntegerLiteral,
  type IntConstant,
  type FunctionDefinition,
  type ServiceDefinition,
} from './type';

// cache parsed document
const fileDocumentMap: Record<string, t.ProtoDocument> = {};
const namespaceDefault = 'root';

// NOTE: cover old Rules: (api_method) = 'POST'
const oldRuleRegExp =
  /\(api_req\)\.|\(api_resp\)\.|\(api_method\)\.|\(pb_idl\.api_method\)\.|\(google\.api\.http\)\./;
const baseTypeConvertMap: Record<string, KeywordType> = {
  int32: SyntaxType.I32Keyword,
  uint32: SyntaxType.I32Keyword,
  sint32: SyntaxType.I32Keyword,
  fixed32: SyntaxType.I32Keyword,
  sfixed32: SyntaxType.I32Keyword,
  int64: SyntaxType.I64Keyword,
  uint64: SyntaxType.I64Keyword,
  sint64: SyntaxType.I64Keyword,
  fixed64: SyntaxType.I64Keyword,
  sfixed64: SyntaxType.I64Keyword,
  string: SyntaxType.StringKeyword,
  double: SyntaxType.DoubleKeyword,
  float: SyntaxType.DoubleKeyword,
  bool: SyntaxType.BoolKeyword,
  bytes: SyntaxType.BinaryKeyword,
};

let cache = true;
let absoluteFileContentMap: Record<string, string> | undefined;
let filenameTypeNamesMap: Record<string, string[]> = {};
let namespaceTypeNamesMap: Record<string, string[]> = {};
let namespaceFilenamesMap: Record<string, string[]> = {};
let entryTypeNames: string[] = [];
let rootDir = '';
let entryLooseAbsoluteFilePath = '';
let entryNamespace = '';
let searchPaths: string[] = [];
let importPathReferNames: Record<string, string> = {};
let isProto3 = true;

function extractExtensionConfigFromOption(
  optionKey: string,
  optionValue: string,
): false | ExtensionConfig {
  let key = '';

  if (/^\(api\.(.*)\)/.test(optionKey)) {
    key = optionKey.replace(/^\(api\.(.*)\)/, '$1');
  } else if (oldRuleRegExp.test(optionKey)) {
    key = optionKey.replace(oldRuleRegExp, '');
  } else {
    return false;
  }

  return extensionUtil.extractExtensionConfig(key, optionValue);
}

function getFieldExtensionConfig(
  options: Record<string, string>,
  fieldName: string,
  fieldType: FieldType,
): ExtensionConfig {
  if (Object.keys(options).length === 0) {
    return {};
  }

  const extensionConfig: FieldExtensionConfig = {};
  for (const key of Object.keys(options)) {
    const value = options[key];
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
          [
            SyntaxType.DoubleKeyword,
            SyntaxType.BoolKeyword,
            SyntaxType.BinaryKeyword,
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

      Object.assign(extensionConfig, config);
    }
  }

  return extensionUtil.filterFieldExtensionConfig(extensionConfig);
}

function getFuncExtensionConfig(
  options: Record<string, string>,
): FunctionExtensionConfig {
  if (Object.keys(options).length === 0) {
    return {};
  }

  const extensionConfig: FunctionExtensionConfig = {};
  for (const key of Object.keys(options)) {
    const value = options[key];
    const config = extractExtensionConfigFromOption(key, value);

    /* istanbul ignore else */
    if (config) {
      Object.assign(extensionConfig, config);
    }
  }

  return extensionUtil.filterFunctionExtensionConfig(extensionConfig);
}

function getServiceExtensionConfig(
  options: Record<string, string>,
): ServiceExtensionConfig {
  if (Object.keys(options).length === 0) {
    return {};
  }

  const extensionConfig: ServiceExtensionConfig = {};
  for (const key of Object.keys(options)) {
    const value = options[key];
    const config = extractExtensionConfigFromOption(key, value);

    /* istanbul ignore else */
    if (config) {
      Object.assign(extensionConfig, config);
    }
  }

  return extensionUtil.filterServiceExtensionConfig(extensionConfig);
}

function getUnifyNamespace(namespace: string): string {
  // NOTE: we use different default namespace for thrift and proto files
  const rawNamespace = namespace || namespaceDefault;
  return rawNamespace.replace(/\./g, '_').replace(/[^a-zA-Z0-9_]/g, '');
}

function getNameIdentifier(
  value: string,
  fullValue: string,
  intactDepth = 0,
): Identifier {
  const parts = fullValue.slice(1).split('.');
  const slicePos = -(intactDepth + 1);
  const namespaceParts = parts.slice(0, slicePos);
  const intactParts = parts.slice(slicePos);

  // NOTE: we use unify namespace to refer value
  let namespaceStr = namespaceParts.join('_');
  if (namespaceParts.length === 0) {
    namespaceStr = namespaceDefault;
  }

  namespaceStr = namespaceStr.replace(/[^a-zA-Z0-9_]/g, '');

  const namespaceValue = `${namespaceStr}.${intactParts.join('.')}`;
  const identiferName: Identifier = {
    type: SyntaxType.Identifier,
    value,
    namespaceValue,
  };

  return identiferName;
}

/**
 *
 * @returns value is a filename refer value from current file
 */
function getReferValue(
  resolvedValue: string,
  fieldScope: string,
): { value: string; namespaceValue: string } {
  /* istanbul ignore next */
  if (resolvedValue === '.google.protobuf.Any') {
    return { value: 'any', namespaceValue: `${namespaceDefault}.any` };
  }

  // If: The type value is resolved successfully.
  // Else: resolved failed. The case is, the refered type is defined in another file with empty namespace or same namespace.
  if (resolvedValue[0] === '.') {
    const undottedResolvedValue = resolvedValue.slice(1);
    // The type value is defined in current file, except when entryNamespace equals to ''
    if (undottedResolvedValue.indexOf(entryNamespace) === 0) {
      if (entryTypeNames.includes(undottedResolvedValue)) {
        const identiferName = undottedResolvedValue.slice(
          entryNamespace.length > 0 ? entryNamespace.length + 1 : 0,
        );
        const namespaceStr = getUnifyNamespace(entryNamespace);
        return {
          value: identiferName,
          namespaceValue: `${namespaceStr}.${identiferName}`,
        };
      }
    }

    // Try the case with incomplete reference, etc. b.c for a.b.c
    const fieldScopeParts = fieldScope.split('.');
    for (let i = 0; i < fieldScopeParts.length; i++) {
      const tempParts = fieldScopeParts.slice(0, i + 1);
      const tempTypeName = `${tempParts.join('.')}.${undottedResolvedValue}`;
      if (entryTypeNames.includes(tempTypeName)) {
        const identiferName = tempTypeName.slice(
          entryNamespace.length > 0 ? entryNamespace.length + 1 : 0,
        );
        const namespaceStr = getUnifyNamespace(entryNamespace);
        return {
          value: identiferName,
          namespaceValue: `${namespaceStr}.${identiferName}`,
        };
      }
    }

    // The type value is defined in other files
    let filenames: string[] = [];
    let namespaceValue = '';
    let identiferName = '';
    const namespaceKeys = Object.keys(namespaceFilenamesMap);
    namespaceKeys.sort((name1, name2) => name2.length - name1.length);

    // Try the case with complete namespace, etc. a.b.c for a.b.c
    for (const namespaceKey of namespaceKeys) {
      if (
        undottedResolvedValue.indexOf(namespaceKey) === 0 &&
        undottedResolvedValue.length > namespaceKey.length
      ) {
        filenames = namespaceFilenamesMap[namespaceKey];
        identiferName = undottedResolvedValue.slice(
          namespaceKey.length > 0 ? namespaceKey.length + 1 : 0,
        );
        namespaceValue = `${getUnifyNamespace(namespaceKey)}.${identiferName}`;
        break;
      }
    }

    // Try the case with incomplete namespace, etc. b.c for a.b.c
    if (filenames.length === 0) {
      const entryNamespaceParts = entryNamespace.split('.');
      if (entryNamespaceParts[0] === '') {
        entryNamespaceParts.splice(0, 1);
      }

      for (let i = 0; i < entryNamespaceParts.length; i++) {
        const preParts = entryNamespaceParts.slice(0, i + 1);
        const compoundValue = [...preParts, undottedResolvedValue].join('.');

        for (const namespaceKey of namespaceKeys) {
          if (
            compoundValue.indexOf(namespaceKey) === 0 &&
            compoundValue.length > namespaceKey.length
          ) {
            filenames = namespaceFilenamesMap[namespaceKey];
            identiferName = compoundValue.slice(namespaceKey.length + 1);
            namespaceValue = `${getUnifyNamespace(
              namespaceKey,
            )}.${identiferName}`;
            break;
          }
        }

        if (filenames.length > 0) {
          break;
        }
      }
    }

    /* istanbul ignore else */
    if (filenames.length > 0) {
      if (filenames.length === 1) {
        return { value: `${filenames[0]}.${identiferName}`, namespaceValue };
      }

      for (const filename of filenames) {
        /* istanbul ignore else */
        const typeNames = filenameTypeNamesMap[filename];
        if (typeNames.includes(identiferName)) {
          return { value: `${filename}.${identiferName}`, namespaceValue };
        }

        // Try nested types
        for (const typeName of typeNames) {
          if (new RegExp(`^${typeName}(\\..+)?$`).test(identiferName)) {
            return { value: `${filename}.${identiferName}`, namespaceValue };
          }
        }
      }
    }
  } else {
    let sortedFilenames: string[] = [];
    const sortedNamespace: string[] = [];
    const parts = entryNamespace.slice(1).split('.');
    for (let i = parts.length; i > 0; i--) {
      const upperNamespace = parts.slice(0, i).join('.');
      if (namespaceFilenamesMap[upperNamespace]) {
        sortedNamespace.push(upperNamespace);
        sortedFilenames = [
          ...sortedFilenames,
          ...namespaceFilenamesMap[upperNamespace],
        ];
      }
    }

    for (const namespace of Object.keys(namespaceFilenamesMap)) {
      if (!sortedNamespace.includes(namespace)) {
        sortedFilenames = [
          ...sortedFilenames,
          ...namespaceFilenamesMap[namespace],
        ];
      }
    }

    let referFilename = '';
    let referNamespace = '';
    for (const filename of sortedFilenames) {
      const typeNames = filenameTypeNamesMap[filename];
      if (typeNames && typeNames.includes(resolvedValue)) {
        referFilename = filename;
        break;
      }
    }

    for (const namespace of Object.keys(namespaceTypeNamesMap)) {
      const typeNames = namespaceTypeNamesMap[namespace];
      if (typeNames && typeNames.includes(resolvedValue)) {
        referNamespace = namespace;
        break;
      }
    }

    return {
      value: `${referFilename}.${resolvedValue}`,
      namespaceValue: `${getUnifyNamespace(referNamespace)}.${resolvedValue}`,
    };
  }

  /* istanbul ignore next */
  return { value: resolvedValue, namespaceValue: resolvedValue };
}

function getBaseTypeOrIdentifier(
  fieldType: t.FieldType,
  fieldScope: string,
): BaseType | Identifier {
  if (fieldType.syntaxType === t.SyntaxType.BaseType) {
    const value = baseTypeConvertMap[fieldType.value];
    const baseType: BaseType = {
      type: value,
    };

    return baseType;
  }

  const { resolvedValue } = fieldType;
  // eslint-disable-next-line prefer-const
  let { value, namespaceValue } = getReferValue(
    resolvedValue as string,
    fieldScope,
  );

  const identifier: Identifier = {
    type: SyntaxType.Identifier,
    value,
    namespaceValue,
  };

  return identifier;
}

function getListType(fieldType: t.FieldType, fieldScope: string): ListType {
  const listType: ListType = {
    type: SyntaxType.ListType,
    valueType: getBaseTypeOrIdentifier(fieldType, fieldScope),
  };

  return listType;
}

function getMapType(
  keyFieldType: t.FieldType,
  valueFieldType: t.FieldType,
  fieldScope: string,
): MapType {
  const keyType = getBaseTypeOrIdentifier(keyFieldType, fieldScope);
  const valueType = getBaseTypeOrIdentifier(valueFieldType, fieldScope);
  const mapType: MapType = {
    type: SyntaxType.MapType,
    keyType,
    valueType,
  };

  return mapType;
}

function getCommentBlocks(comment?: string): CommentBlock[] {
  if (!comment) {
    return [];
  }

  const commentBlock: CommentBlock = {
    type: SyntaxType.CommentBlock,
    value: [comment],
  };

  return [commentBlock];
}

function getIntConstant(value: number): IntConstant {
  const integerLiteral: IntegerLiteral = {
    type: SyntaxType.IntegerLiteral,
    value: String(value),
  };

  const intConst: IntConstant = {
    type: SyntaxType.IntConstant,
    value: integerLiteral,
  };

  return intConst;
}

function getEntityRoot(root: t.ProtoRoot, namespace: string): t.NamespaceBase {
  if (namespace === '') {
    return root;
  }

  let entityRoot: t.NamespaceBase = root;
  const parts = namespace.split('.');
  for (let i = 0; i < parts.length; i++) {
    entityRoot = (entityRoot.nested as Record<string, t.NamespaceBase>)[
      parts[i]
    ];
  }

  return entityRoot;
}

function getEnumMember(name: string, value: number): EnumMember {
  const identiferName: Identifier = {
    type: SyntaxType.Identifier,
    value: name,
  };

  const initializer = getIntConstant(value);
  const member: EnumMember = {
    type: SyntaxType.EnumMember,
    name: identiferName,
    initializer,
    comments: [],
  };

  return member;
}

function setImportedInfo(
  importPaths: string[],
  fatherLooseAbsoluteFilePath: string,
): void {
  // reset global variables
  filenameTypeNamesMap = {};
  namespaceTypeNamesMap = {};
  namespaceFilenamesMap = {};
  importPathReferNames = {};
  if (importPaths.length === 0) {
    return;
  }

  for (const importPath of importPaths) {
    if (!/^google\/protobuf/.test(importPath)) {
      const looseImportPath = importPath.replace(/\.proto$/, '');
      // try relative path
      let looseAbsoluteFilePath = getPosixPath(
        path.join(path.dirname(fatherLooseAbsoluteFilePath), looseImportPath),
      );

      // try absulote path
      const alternativeLooseAbsoluteFilePath = looseImportPath;

      let document =
        fileDocumentMap[looseAbsoluteFilePath] ||
        fileDocumentMap[alternativeLooseAbsoluteFilePath];
      if (!document) {
        let content = '';
        if (absoluteFileContentMap) {
          content = absoluteFileContentMap[`${looseAbsoluteFilePath}.proto`];
          if (typeof content === 'undefined') {
            content =
              absoluteFileContentMap[
                `${alternativeLooseAbsoluteFilePath}.proto`
              ];
            if (typeof content === 'undefined') {
              logAndThrowError(
                `file ${looseAbsoluteFilePath}.proto does not exist in fileContentMap`,
              );
            }

            looseAbsoluteFilePath = alternativeLooseAbsoluteFilePath;
          }
        } else {
          let fullFilePath = getPosixPath(
            path.resolve(rootDir, `${looseAbsoluteFilePath}.proto`),
          );

          // Search
          if (!fs.existsSync(fullFilePath)) {
            const filePaths = [rootDir, ...searchPaths].map(searchPath =>
              getPosixPath(
                path.resolve(
                  rootDir,
                  searchPath,
                  `${alternativeLooseAbsoluteFilePath}.proto`,
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
              looseAbsoluteFilePath = getPosixPath(
                path.relative(rootDir, existedFilePath),
              ).replace(/\.proto$/, '');
            }
          }

          content = fs.readFileSync(fullFilePath, 'utf8');
        }

        document = parseContent(content, looseAbsoluteFilePath);
      } else if (!fileDocumentMap[looseAbsoluteFilePath]) {
        looseAbsoluteFilePath = alternativeLooseAbsoluteFilePath;
      }

      const namespace = document.package || '';

      const filename = looseAbsoluteFilePath.split('/').pop() as string;

      // Compatible with multi same names
      let fakeFilename = filename;
      while (filenameTypeNamesMap[fakeFilename]) {
        fakeFilename += 'x';
      }

      importPathReferNames[importPath] = fakeFilename;

      // NOTE: we use original namespace instead of unify namespace to do replacements
      if (namespaceFilenamesMap[namespace]) {
        namespaceFilenamesMap[namespace].push(fakeFilename);
      } else {
        namespaceFilenamesMap[namespace] = [fakeFilename];
      }

      const entityRoot = getEntityRoot(document.root, namespace);
      /* istanbul ignore next */
      const typeNames = Object.keys(entityRoot.nested || {});
      filenameTypeNamesMap[fakeFilename] = typeNames;

      if (namespaceTypeNamesMap[namespace]) {
        namespaceTypeNamesMap[namespace] = [
          ...namespaceTypeNamesMap[namespace],
          ...typeNames,
        ];
      } else {
        namespaceTypeNamesMap[namespace] = typeNames;
      }
    }
  }
}

function convertFieldDefinition(
  field: t.FieldDefinition,
  nestedDepth = 0,
): FieldDefinition {
  const {
    id,
    name,
    fullName = '',
    optional,
    type,
    keyType,
    repeated,
    map,
    rule,
    comment,
    options,
  } = field;

  const newName = getNameIdentifier(name, fullName, nestedDepth + 1);
  const comments = getCommentBlocks(comment);
  const fieldID: FieldID = {
    type: SyntaxType.FieldID,
    value: id,
  };

  let fieldType: FieldType;
  const fieldScope = fullName
    .split('.')
    .filter(item => item !== '')
    .slice(0, -1)
    .join('.');
  if (repeated) {
    fieldType = getListType(type, fieldScope);
  } else if (map) {
    fieldType = getMapType(keyType as t.FieldType, type, fieldScope);
  } else {
    fieldType = getBaseTypeOrIdentifier(type, fieldScope);
  }

  const fieldExtensionConfig = getFieldExtensionConfig(
    options || {},
    name,
    fieldType,
  );

  let requiredness: FieldRequired | undefined;
  if (!isProto3) {
    requiredness = optional ? 'optional' : 'required';
  } else if (rule === 'required') {
    // TODO: Handle optional cases, need to modify proto-parser
    requiredness = 'required';
  }

  if (fieldExtensionConfig.tag?.includes('required')) {
    requiredness = 'required';
  }

  if (fieldExtensionConfig.tag?.includes('int2str')) {
    fieldType = convertIntToString(fieldType);
  }

  const fieldDefinition: FieldDefinition = {
    type: SyntaxType.FieldDefinition,
    name: newName,
    fieldID,
    fieldType,
    requiredness,
    defaultValue: undefined,
    comments,
    options,
    extensionConfig: fieldExtensionConfig,
  };

  return fieldDefinition;
}

function convertEnumDefinition(
  astEnum: t.EnumDefinition,
  nestedDepth = 0,
): EnumDefinition {
  const { name, fullName, comment, options, values } = astEnum;

  const newName = getNameIdentifier(name, fullName as string, nestedDepth);
  const comments = getCommentBlocks(comment);
  const members: EnumMember[] = [];
  for (const memberName of Object.keys(values)) {
    const memberValue = values[memberName];
    const enumMember = getEnumMember(memberName, memberValue);
    members.push(enumMember);
  }

  const enumDefinition: EnumDefinition = {
    type: SyntaxType.EnumDefinition,
    name: newName,
    members,
    comments,
    options,
  };

  return enumDefinition;
}

function convertMessageDefinition(
  astMessage: t.MessageDefinition,
  nestedDepth = 0,
): StructDefinition {
  const { name, fullName, fields, comment, options } = astMessage;

  const newName = getNameIdentifier(name, fullName as string, nestedDepth);
  const comments = getCommentBlocks(comment);
  const newFields: FieldDefinition[] = Object.values(fields)
    .map(field => convertFieldDefinition(field, nestedDepth))
    .filter(field => {
      const tag = (field.extensionConfig && field.extensionConfig.tag) || '';
      return !tag.includes('ignore');
    });

  const structDefinition: StructDefinition = {
    type: SyntaxType.StructDefinition,
    name: newName,
    fields: newFields,
    comments,
    options,
  };

  if (astMessage.nested) {
    const subStatements = Object.values(astMessage.nested).filter(item =>
      [t.SyntaxType.MessageDefinition, t.SyntaxType.EnumDefinition].includes(
        item.syntaxType,
      ),
    );
    const nested: Record<string, StructDefinition | EnumDefinition> = {};
    for (const subStatement of subStatements) {
      if (subStatement.syntaxType === t.SyntaxType.MessageDefinition) {
        nested[subStatement.name] = convertMessageDefinition(
          subStatement as t.MessageDefinition,
          nestedDepth + 1,
        );
      } else {
        nested[subStatement.name] = convertEnumDefinition(
          subStatement as t.EnumDefinition,
          nestedDepth + 1,
        );
      }
    }

    structDefinition.nested = nested;
  }

  return structDefinition;
}

function convertMethodDefinition(
  astMethod: t.MethodDefinition,
): FunctionDefinition {
  const {
    name,
    fullName = '',
    comment,
    options,
    requestType,
    responseType,
  } = astMethod;

  const newName = getNameIdentifier(name, fullName, 1);
  const comments = getCommentBlocks(comment);
  const fieldScope = fullName
    .split('.')
    .filter(item => item !== '')
    .slice(0, -1)
    .join('.');
  const returnType = getBaseTypeOrIdentifier(responseType, fieldScope);
  const requestParamType = getBaseTypeOrIdentifier(requestType, fieldScope);
  const requestParamName: Identifier = {
    type: SyntaxType.Identifier,
    value: 'request',
  };

  const requestParamId: FieldID = {
    type: SyntaxType.FieldID,
    value: 1,
  };

  const requestFieldDefinition: FieldDefinition = {
    type: SyntaxType.FieldDefinition,
    name: requestParamName,
    fieldID: requestParamId,
    fieldType: requestParamType,
    comments: [],
  };

  const FuncExtensionConfig = getFuncExtensionConfig(options || {});
  const functionDefinition: FunctionDefinition = {
    type: SyntaxType.FunctionDefinition,
    name: newName,
    oneway: false,
    modifiers: [],
    returnType,
    fields: [requestFieldDefinition],
    throws: [],
    comments,
    options,
    extensionConfig: FuncExtensionConfig,
  };

  return functionDefinition;
}

function convertServiceDefinition(
  astService: t.ServiceDefinition,
): ServiceDefinition {
  const { name, fullName, methods, comment, options } = astService;

  const newName = getNameIdentifier(name, fullName as string);
  const comments = getCommentBlocks(comment);
  const functions: FunctionDefinition[] = [];
  for (const method of Object.values(methods)) {
    functions.push(convertMethodDefinition(method));
  }

  const serviceExtensionConfig = getServiceExtensionConfig(options || {});
  const serviceDefinition: ServiceDefinition = {
    type: SyntaxType.ServiceDefinition,
    name: newName,
    functions,
    comments,
    options,
    extensionConfig: serviceExtensionConfig,
  };

  return serviceDefinition;
}

function parseContent(
  content: string,
  looseAbsoluteFilePath: string,
): t.ProtoDocument {
  if (fileDocumentMap[looseAbsoluteFilePath]) {
    return fileDocumentMap[looseAbsoluteFilePath];
  }

  const document: t.ProtoDocument | t.ProtoError = t.parse(content, {
    weakResolve: true,
  });

  if ((document as t.ProtoError).syntaxType === t.SyntaxType.ProtoError) {
    const { line, message } = document as t.ProtoError;
    const fullFilePath = path.resolve(
      rootDir,
      `${looseAbsoluteFilePath}.proto`,
    );
    const fullMessage = `${message}(${fullFilePath}:${line}:0)`;
    logAndThrowError(fullMessage, message);
  }

  if (cache) {
    fileDocumentMap[looseAbsoluteFilePath] = document as t.ProtoDocument;
  }

  isProto3 = (document as t.ProtoDocument).syntax === 'proto3';
  return document as t.ProtoDocument;
}

function getTypeNameRecursively(statement: t.NamespaceBase) {
  let typeName = statement.fullName || statement.name;
  if (typeName[0] === '.') {
    typeName = typeName.slice(1);
  }
  let typeNames = [typeName];
  const nesteds = Object.values(statement.nested || {});
  if (nesteds.length > 0) {
    for (const nested of nesteds) {
      const nestedTypeNames = getTypeNameRecursively(nested);
      typeNames = [...typeNames, ...nestedTypeNames];
    }
  }

  return typeNames;
}

export function parseProtoContent(
  content: string,
  option: {
    loosePath: string;
    rootDir: string;
    cache: boolean;
    searchPaths: string[];
  },
  fileContentMap?: Record<string, string>,
): UnifyDocument {
  rootDir = option.rootDir;
  entryLooseAbsoluteFilePath = option.loosePath;
  cache = option.cache;
  searchPaths = option.searchPaths;
  absoluteFileContentMap = fileContentMap;

  // parse file content
  const document = parseContent(content, entryLooseAbsoluteFilePath);
  entryNamespace = document.package || '';
  const entityRoot = getEntityRoot(document.root, entryNamespace);
  setImportedInfo(document.imports || [], entryLooseAbsoluteFilePath);

  const statementGroup: Record<string, t.NamespaceBase[]> = {};
  for (const statement of Object.values(
    (entityRoot.nested || {}) as Record<string, t.NamespaceBase>,
  )) {
    /* istanbul ignore else */
    if (
      [
        t.SyntaxType.MessageDefinition,
        t.SyntaxType.EnumDefinition,
        t.SyntaxType.ServiceDefinition,
      ].includes(statement.syntaxType)
    ) {
      if (statementGroup[statement.syntaxType]) {
        statementGroup[statement.syntaxType].push(statement);
      } else {
        statementGroup[statement.syntaxType] = [statement];
      }
    }
  }

  entryTypeNames = [];
  Object.keys(statementGroup)
    .filter(syntaxType =>
      [t.SyntaxType.MessageDefinition, t.SyntaxType.EnumDefinition].includes(
        syntaxType as any,
      ),
    )
    .forEach(syntaxType => {
      for (const statement of statementGroup[syntaxType]) {
        const typeNames = getTypeNameRecursively(statement);
        entryTypeNames = [...entryTypeNames, ...typeNames];
      }
    });

  entryTypeNames.sort(
    (typeName1, typeName2) => typeName1.length - typeName2.length,
  );

  const statements: UnifyStatement[] = [];
  if (statementGroup[t.SyntaxType.MessageDefinition]) {
    for (const astMessage of statementGroup[t.SyntaxType.MessageDefinition]) {
      statements.push(
        convertMessageDefinition(astMessage as t.MessageDefinition),
      );
    }
  }

  if (statementGroup[t.SyntaxType.EnumDefinition]) {
    for (const astEnum of statementGroup[t.SyntaxType.EnumDefinition]) {
      statements.push(convertEnumDefinition(astEnum as t.EnumDefinition));
    }
  }

  if (statementGroup[t.SyntaxType.ServiceDefinition]) {
    for (const astService of statementGroup[t.SyntaxType.ServiceDefinition]) {
      statements.push(
        convertServiceDefinition(astService as t.ServiceDefinition),
      );
    }
  }

  const unifyNamespace = getUnifyNamespace(entryNamespace);
  const unifyDocument: UnifyDocument = {
    type: SyntaxType.UnifyDocument,
    namespace: entryNamespace,
    unifyNamespace,
    includes: document.imports || [],
    includeRefer: importPathReferNames,
    statements,
  };

  return unifyDocument;
}
