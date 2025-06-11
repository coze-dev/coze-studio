import path from 'path';
import { EOL } from 'os';

import {
  type IGenTemplateCtx,
  type ProcessIdlCtx,
  genAst,
  getOutputName,
  getRelativePath,
} from '@coze-arch/idl2ts-helper';
import type t from '@babel/types';

import { type Options } from './types';

function unifyUrl(apiUri: string, pathParams: string[] = []) {
  const unmappedParams = [] as string[];
  const matches = apiUri.match(/:([^/]+)/g) || [];
  if (matches.length === 0) {
    return { apiUri, unmappedParams };
  }

  matches.forEach(item => {
    const target = item.slice(1);
    if (!pathParams.includes(target)) {
      apiUri = apiUri.replace(
        item,
        `\${option.pathParams?.${target}??config.getParams!('${target}')}`,
      );
      // if (target === "namespace") {
      //     apiUri = apiUri.replace(item, `\${config.getNamespace()}`);
      //     return;
      // } else {
      //     console.log(matches)
      //     console.warn(`path param ${target} invalid, fallback with options params`);
      unmappedParams.push(target);
      //     apiUri = apiUri.replace(item, `\${option.pathParams.${target}}`);
      // }
    } else {
      apiUri = apiUri.replace(item, `\${req.${target}}`);
    }
  });
  return { apiUri, unmappedParams };
}

export function genFunc(ctx: IGenTemplateCtx) {
  const { meta } = ctx;
  const { reqType, resType, name } = meta;
  const { unmappedParams } = unifyUrl(meta.url, meta.reqMapping.path);
  const funcName = `${name}`;
  const optionType =
    unmappedParams.length > 0
      ? `,{${unmappedParams.map(i => `${i}: string|number`).join(';')}}`
      : '';
  const funTemplate = `const ${funcName} = /*#__PURE__*/ createAPI<${reqType}, ${resType} ${optionType}>(${JSON.stringify(
    meta,
    undefined,
    2,
  )})${EOL}`;

  return funTemplate;
  // return genAst<t.ExportNamedDeclaration>(funTemplate);
}

export function genPublic(ctx: ProcessIdlCtx, option: Options) {
  const { ast } = ctx;
  const fileName = getOutputName({
    source: ast.idlPath,
    idlRoot: option.idlRoot,
    outputDir: option.outputDir,
  });
  const pathName = getRelativePath(
    fileName,
    option.commonCodePath || path.resolve(option.outputDir, './_common.ts'),
  );
  const code = `import { createAPI } from '${pathName}'`;
  return genAst<t.Declaration>(code);
}

export function genMockPublic(ctx: ProcessIdlCtx, option: Options) {
  const { ast } = ctx;
  const fileName = getOutputName({
    source: ast.idlPath,
    idlRoot: option.idlRoot,
    outputDir: option.outputDir,
  });
  const pathName = getRelativePath(
    fileName,
    path.resolve(option.outputDir, './_mock_utils.js'),
  );
  const code = `const  { createStruct } = require('${pathName}')`;
  return genAst<t.Declaration>(code);
}
