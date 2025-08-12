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

import path from 'path';

import prettier, { type Options } from 'prettier';
import fs from 'fs-extra';
import { SyntaxType } from '@coze-arch/idl-parser';
import { type Program, type File, type Node } from '@babel/types';
import * as t from '@babel/types';
import template from '@babel/template';
import { type ParserPlugin, parse } from '@babel/parser';

import * as h from './types';
import { ReservedKeyWord } from './constant';
export const plugins: ParserPlugin[] = [
  'typescript',
  'decorators-legacy',
  'classProperties',
  'doExpressions',
];
export const createFile = (source: string) => {
  const program: Program = template.program(source, {
    plugins,
  })();
  const file: File = {
    type: 'File',
    loc: program.loc,
    start: program.start,
    end: program.end,
    program,
    comments: [],
    tokens: null,
    leadingComments: [],
    trailingComments: [],
    innerComments: [],
  };
  return file;
};

export function createIdWithTypeAnnotation(exp: string) {
  const dec = template.ast(`let ${exp}`, { plugins }) as t.VariableDeclaration;
  return dec.declarations[0].id as t.Identifier;
}

export const parseFile = (fileName: string) =>
  parse(fs.readFileSync(fileName, 'utf8'), {
    sourceType: 'module',
    plugins,
  });

export function formatCode(code: string, root = '.') {
  const defaultConfig: Options = {
    tabWidth: 2,
    printWidth: 120,
    singleQuote: true,
  };
  const file = path.resolve(process.cwd(), root, './for-prettier-bug'); // Be sure to add an extra level catalog here.
  const config = prettier.resolveConfig(file, { editorconfig: true });
  return prettier.format(code, {
    ...(config || defaultConfig),
    parser: 'typescript',
  });
}

export function disableLint<T extends Node>(node: T, isTs = true) {
  return t.addComment<T>(
    node,
    'leading',
    isTs ? ' tslint:disable ' : ' eslint-disable ',
  );
}

export async function safeWriteFile(fileName: string, content: string) {
  await fs.ensureDirSync(path.dirname(fileName));
  await fs.writeFile(fileName, content, 'utf8');
}

export function addComment<T extends t.Node = t.Node>(
  node: T,
  comments: h.Comment[],
  position?: t.CommentTypeShorthand,
): T {
  const [content, multi] = convertVComments(comments);
  if (content) {
    return t.addComment(
      node,
      position || multi ? 'leading' : 'trailing',
      content,
      !multi,
    );
  } else {
    return node;
  }
}

export function convertVComments(comments: h.Comment[]): [string, boolean] {
  if (!comments) {
    return ['', false];
  }
  let res = [] as string[];
  for (const comment of comments) {
    const { value } = comment;
    if (Array.isArray(value)) {
      res = [...res, ...value];
    } else {
      res = [...res, value];
    }
  }
  if (res.length > 1) {
    return [
      `*\n * ${res.map(i => i.replace(/\*\//g, '/')).join('\n * ')}\n`,
      true,
    ];
  }
  if (res.length > 0) {
    return [`* ${res[0]?.replace(/\*\//g, '/')} `, true];
  }

  return ['', false];
}

export function getRelativePath(from: string, to: string) {
  let relative = path.relative(path.parse(from).dir, to);
  relative = !relative.startsWith('.') ? `./${relative}` : relative;
  return removeFileExt(relative);
}

export function removeFileExt(fileName: string) {
  const [_, ...target] = fileName.split('.').reverse();
  const res = target.reverse().join('.');
  return res.startsWith('./') || res.startsWith('/') ? res : `./${res}`;
}

export function parseIdFiledType(fieldType: h.Identifier) {
  const { value } = fieldType;
  const namespaceArr = value.split('.');
  const [refName, ...namespace] = namespaceArr.reverse();
  const namespaceName = namespace.reverse().join('.');
  return {
    refName,
    namespace: namespaceName,
  };
}

export function parseId(id: string) {
  const res = id.split('.');
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const name = res.pop()!;
  const namespace = uniformNs(res.join('_'));
  return namespace ? `${namespace}.${name}` : name;
}

export function uniformNs(ns: string) {
  if (ReservedKeyWord.includes(ns)) {
    // Hit the reserved word, treated as an underscore
    return `_${ns}`;
  }
  return ns.replace(/\./g, '_');
}

export function getValuesFromEnum(params: h.EnumDefinition) {
  const { members } = params;
  let currentVal = 0;
  const enumArr = [] as number[];
  for (const member of members) {
    const { initializer } = member;
    if (initializer) {
      if (h.isIntegerLiteral(initializer.value)) {
        currentVal = Number(initializer.value.value);
      } else if (h.isHexLiteral(initializer.value)) {
        // hexadecimal
        currentVal = Number(initializer.value.value);
      }
      enumArr.push(currentVal);
    } else {
      enumArr.push(currentVal);
    }
    currentVal = currentVal + 1;
  }
  return enumArr;
}

export function parseFiledName(filed: h.FieldDefinition) {
  const { name, extensionConfig } = filed;
  if (extensionConfig?.key === '.') {
    return name.value;
  }
  return extensionConfig?.key || name.value;
}

export function getAnnotation(
  annotations: h.Annotations | undefined,
  name: string,
) {
  if (!annotations) {
    return undefined;
  }
  for (const ele of annotations.annotations) {
    if (ele.name.value === name) {
      return ele.value && ele.value.value;
    }
  }
  return undefined;
}

// export function parseAnnotations(anno: h.Annotations) {
//     const result = {} as { [key: string]: string };
//     anno.annotations.forEach((i) => {
//         const { name, value } = i;
//         result[name.value] = value ? value.value : "";
//     });
//     return result;
// }

export function getNamespaceByPath(idlPath: string) {
  return (idlPath.split('/').pop() as string).replace(/\.(thrift|proto)$/, '');
}

export function genAst<T = unknown>(code: string): T {
  return template.ast(code, {
    plugins,
    preserveComments: true,
    startLine: 2,
  }) as any;
}

export function getStatementById(
  id: h.Identifier,
  current: h.IParseResultItem,
) {
  const { namespace, refName } = parseIdFiledType(id);
  let statement: h.UnifyStatement | undefined;
  if (namespace) {
    const ast = getAstFromNamespace(namespace, current);
    statement = h.findDefinition(ast, refName);
  } else {
    statement = h.findDefinition(current.statements, id.value);
  }

  if (!statement) {
    throw new Error(`can not find Struct: ${id.value} `);
  }
  return statement;
}

export function getAstFromNamespace(
  namespace: string,
  current: h.IParseResultItem,
) {
  const item = getParseResultFromNamespace(namespace, current);

  return item.statements;
}

export function getParseResultFromNamespace(
  namespace: string,
  current: h.IParseResultItem,
) {
  let item = null as h.IParseResultItem | null;

  for (const file in current.deps) {
    // eslint-disable-next-line no-prototype-builtins
    if (current.deps.hasOwnProperty(file)) {
      const element = current.deps[file];
      const ns = getNamespaceByPath(file);
      if (ns === namespace) {
        item = element;
        break;
      }
    }
  }
  if (!item) {
    throw new Error(`can not find ast by namespace : ${namespace}`);
  }
  return item;
}

export function ignoreField(f: h.FieldDefinition) {
  if (['KContext', 'Base', 'BaseResp'].includes(f.name.value)) {
    return false;
  }
  if (h.isIdentifier(f.fieldType)) {
    return !['base.Base', 'base.BaseResp'].includes(f.fieldType.value);
  }
  return true;
}

export function isFullBody(f: h.FieldDefinition) {
  return (
    (f.extensionConfig?.position === 'body' && f.extensionConfig.key === '.') ||
    getAnnotation(f.annotations, 'api.full_body') !== undefined
  );
}

export function hasDynamicJsonAnnotation(annotations?: h.Annotations) {
  if (!annotations) {
    return false;
  }
  return annotations.annotations.find(i =>
    [
      'kgw.json',
      'kgw.json.req',
      'kgw.json.resp',
      'api.request.converter',
      'api.response.converter',
    ].some(k => k === i.name.value),
  );
}

/**
 * Parse the real type between the front end and the gateway from api. (request | response).converter.
 * To be able to come up with these two annotations, this protocol is disgusting😭
 * @param annotations
 * @returns
 */
export function getTypeFromDynamicJsonAnnotation(
  annotations?: h.Annotations,
): undefined | 'string' | 'Object' | 'unknown' {
  if (!annotations) {
    return undefined;
  }
  const requestVal = annotations.annotations.find(
    i => i.name.value === 'api.request.converter',
  )?.value?.value;
  const responseVal = annotations.annotations.find(
    i => i.name.value === 'api.response.converter',
  )?.value?.value;
  const typeValue = [
    [undefined, 'string', 'Object'],
    ['Object', 'unknown', 'string'],
    ['Object', 'Object', 'unknown'],
  ] as const;
  const index = (value: undefined | 'encode' | 'decode' | string) =>
    value === 'encode' ? 2 : value === 'decode' ? 1 : 0;
  return typeValue[index(responseVal)][index(requestVal)];
}

export function getFieldsAlias(i: h.FieldDefinition) {
  return parseFiledName(i);
}

export function withExportDeclaration(
  node: t.Declaration,
  comments?: h.Comment[],
) {
  const declaration = t.exportNamedDeclaration(node);
  if (!comments) {
    return declaration;
  }
  return addComment(declaration, comments, 'leading');
}

export function getSchemaRootByPath(absFile: string, idlRoot: string) {
  const pathName = path
    .relative(idlRoot, removeFileExt(absFile))
    .replace(/\//g, '_');

  return `api://schemas/${pathName}`;
}

export function getOutputName(params: {
  source: string;
  idlRoot: string;
  outputDir: string;
}) {
  const relativeName = path.relative(params.idlRoot, params.source);
  return path.resolve(params.outputDir, relativeName);
}

export function transformFieldId(fieldName: string) {
  return fieldName.includes('-')
    ? t.stringLiteral(fieldName)
    : t.identifier(fieldName);
}

export function getBaseTypeConverts(i64Type: string) {
  let newType = 'number';
  if (i64Type === 'string') {
    newType = 'string';
  }

  return {
    [SyntaxType.ByteKeyword]: 'number',
    [SyntaxType.I8Keyword]: 'number',
    [SyntaxType.I16Keyword]: 'number',
    [SyntaxType.I32Keyword]: 'number',
    [SyntaxType.I64Keyword]: newType,
    [SyntaxType.DoubleKeyword]: 'number',
    [SyntaxType.BinaryKeyword]: 'object',
    [SyntaxType.StringKeyword]: 'string',
    [SyntaxType.BoolKeyword]: 'boolean',
  };
}
