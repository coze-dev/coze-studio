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

import * as path from 'path';

import { parse, type UnifyDocument } from '@coze-arch/idl-parser';

import { isPbFile, lookupFile } from './utils';
import type * as t from './types';
import { getNamespaceByPath, uniformNs } from './helper';

export function parseDSL(
  idlFullPaths: string[],
  parsedRes: t.IParseResultItem[] = [],
  idlRoot: string = process.cwd(),
): t.IParseResultItem[] {
  const results = parsedRes;
  const entries =
    typeof idlFullPaths === 'string' ? [idlFullPaths] : idlFullPaths;
  const isPb = isPbFile(idlFullPaths[0]);
  function addResult(res: t.IParseResultItem) {
    if (!results.find(i => i.idlPath === res.idlPath)) {
      results.push(res);
    }
  }

  function _parse(idlFullPath: string, isEntry = false) {
    const target = results.find(i => i.idlPath === idlFullPath);
    if (target) {
      if (isEntry) {
        target.isEntry = true;
      }
      return target;
    }
    const ast: UnifyDocument = parse(idlFullPath, {
      cache: false,
      ignoreGoTagDash: false,
      root: idlRoot,
      namespaceRefer: true,
      searchPaths: [path.dirname(idlFullPath)],
    });
    const res = {
      ...ast,
      deps: {},
      includeMap: {},
      idlPath: idlFullPath,
      isEntry,
    } as t.IParseResultItem;
    addResult(res);
    if (ast.includes && ast.includes.length > 0) {
      ast.includes.forEach(i => {
        if (/google\/(protobuf|api)/.test(i)) {
          return;
        }
        const filePath = isPb
          ? lookupFile(i, [path.dirname(idlFullPath), idlRoot])
          : path.resolve(path.dirname(idlFullPath), i);
        const subResults = _parse(filePath);
        if (subResults) {
          res.deps[filePath] = subResults;
          res.includeMap[i] = filePath;
          if (!isPb) {
            res.includeRefer[i] = getNamespaceByPath(i);
          }
          res.includeRefer[i] = uniformNs(res.includeRefer[i]);
          addResult(subResults);
        }
      });
    }

    return res;
  }

  entries.forEach(i => {
    _parse(i, true);
  });

  return results;
}
