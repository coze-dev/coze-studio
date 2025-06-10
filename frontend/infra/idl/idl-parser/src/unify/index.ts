import * as path from 'path';
import * as fs from 'fs';
import { logAndThrowError , mergeObject, getPosixPath } from '../utils';
import { parseThriftContent } from './thrift';
import { parseProtoContent } from './proto';
import { type UnifyDocument } from './type';

type FileType = 'thrift' | 'proto';

// export statements
export * from './type';

export interface ParseOption {
  root?: string;
  namespaceRefer?: boolean;
  cache?: boolean;
  ignoreGoTag?: boolean;
  ignoreGoTagDash?: boolean;
  preproccess?: (param: { content: string; path?: string }) => string;
  searchPaths?: string[];
}

const parseOptionDefault: ParseOption = {
  root: '.',
  namespaceRefer: true,
  cache: false,
  ignoreGoTag: false,
  ignoreGoTagDash: false,
  searchPaths: [],
};

// the key of fileContentMap should be absolute path
export function parse(
  filePath: string,
  option: ParseOption = {},
  fileContentMap?: Record<string, string>,
): UnifyDocument {
  const {
    root,
    namespaceRefer,
    cache,
    ignoreGoTag,
    ignoreGoTagDash,
    preproccess,
    searchPaths,
  } = mergeObject(parseOptionDefault, option) as Required<ParseOption>;

  const fullRootDir = getPosixPath(path.resolve(process.cwd(), root));
  let fullFilePath = getPosixPath(path.resolve(fullRootDir, filePath));
  let idlFileType: FileType = 'thrift';
  let content = '';

  if (/\.thrift$/.test(filePath)) {
    fullFilePath = getPosixPath(path.resolve(fullRootDir, filePath));
    if (fileContentMap) {
      content = fileContentMap[filePath];
      if (typeof content === 'undefined') {
        logAndThrowError(`file "${filePath}" does not exist in fileContentMap`);
      }
    } else {
      if (!fs.existsSync(fullFilePath)) {
        const message = `no such file: ${fullFilePath}`;
        logAndThrowError(message);
      }

      content = fs.readFileSync(fullFilePath, 'utf8');
    }
  } else if (/\.proto$/.test(filePath)) {
    idlFileType = 'proto';
    fullFilePath = getPosixPath(path.resolve(fullRootDir, filePath));
    if (fileContentMap) {
      content = fileContentMap[filePath];
      if (typeof content === 'undefined') {
        logAndThrowError(`file "${filePath}" does not exist in fileContentMap`);
      }
    } else {
      if (!fs.existsSync(fullFilePath)) {
        const message = `no such file: ${fullFilePath}`;
        logAndThrowError(message);
      }

      content = fs.readFileSync(fullFilePath, 'utf8');
    }
  } else {
    const message = `invalid filePath: "${filePath}"`;
    logAndThrowError(message);
  }

  const absoluteFilePath = getPosixPath(
    path.relative(fullRootDir, fullFilePath),
  );
  if (typeof preproccess === 'function') {
    content = preproccess({ content, path: absoluteFilePath });
  }

  if (idlFileType === 'thrift') {
    const looseAbsoluteFilePath = absoluteFilePath.replace(/\.thrift$/, '');
    const document = parseThriftContent(
      content,
      {
        loosePath: looseAbsoluteFilePath,
        rootDir: fullRootDir,
        namespaceRefer,
        cache,
        ignoreGoTag,
        ignoreGoTagDash,
        searchPaths,
      },
      fileContentMap,
    );

    return document;
  }

  const looseAbsoluteFilePath = absoluteFilePath.replace(/\.proto$/, '');
  const document = parseProtoContent(
    content,
    {
      loosePath: looseAbsoluteFilePath,
      rootDir: fullRootDir,
      cache,
      searchPaths,
    },
    fileContentMap,
  );

  return document;
}
