import { RuleResult, Config, Rule } from '../types';
import { FILE_PATTERNS } from '../config';
import { readFile, isJavaScriptOrTypeScript, exists } from '../utils/file';
import { getFileContentAtRef, isNewFile } from '../utils/git';
import { parse } from '@typescript-eslint/parser';

/**
 * Rule definition for detecting comment-only changes using AST
 */
export const AST_COMMENT_RULE: Rule = {
  name: 'ast-comment-only',
  description: 'Detects JS/TS files that have only comment changes using AST comparison',
  filePatterns: FILE_PATTERNS.TYPESCRIPT_JAVASCRIPT
} as const;

/**
 * Create a result object for the AST comment rule
 */
const createResult = (
  filePath: string,
  shouldRevert: boolean,
  reason?: string,
  error?: string
): RuleResult => ({
  filePath,
  ruleName: AST_COMMENT_RULE.name,
  shouldRevert,
  reason,
  error
});

/**
 * Log verbose messages if enabled
 */
const log = (message: string, config: Config): void => {
  if (config.verbose) {
    console.log(`[${AST_COMMENT_RULE.name}] ${message}`);
  }
};

/**
 * Parse file content and return AST with comments removed
 */
const parseWithoutComments = (filePath: string, content: string): any => {
  const isTypeScript = filePath.match(/\.(ts|tsx)$/);
  const isJSX = filePath.match(/\.(tsx|jsx)$/);

  const ast = parse(content, {
    loc: true,
    range: true,
    comment: true,
    ecmaVersion: 'latest' as any,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: !!isJSX,
    },
    ...(isTypeScript && {
      filePath,
    }),
  });

  return removeComments(ast);
};

/**
 * Recursively remove comment-related properties from AST nodes
 */
const removeComments = (node: any): any => {
  if (!node || typeof node !== 'object') {
    return node;
  }

  if (Array.isArray(node)) {
    return node.map(item => removeComments(item));
  }

  const cleaned: any = {};
  for (const [key, value] of Object.entries(node)) {
    // Skip comment-related properties
    if (key === 'comments' || key === 'leadingComments' || key === 'trailingComments') {
      continue;
    }
    // Skip location information that might differ due to comments
    if (key === 'range' || key === 'loc' || key === 'start' || key === 'end') {
      continue;
    }

    cleaned[key] = removeComments(value);
  }

  return cleaned;
};

/**
 * Deep equality comparison of two objects
 */
const deepEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;

  if (obj1 == null || obj2 == null) return obj1 === obj2;

  if (typeof obj1 !== typeof obj2) return false;

  if (typeof obj1 !== 'object') return obj1 === obj2;

  if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;

  if (Array.isArray(obj1)) {
    if (obj1.length !== obj2.length) return false;
    for (let i = 0; i < obj1.length; i++) {
      if (!deepEqual(obj1[i], obj2[i])) return false;
    }
    return true;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
};

/**
 * Analyze a file for comment-only changes using AST comparison
 */
export const analyzeAstCommentRule = async (filePath: string, config: Config): Promise<RuleResult> => {
  log(`Analyzing file for comment-only changes: ${filePath}`, config);

  try {
    // Check if file exists
    if (!exists(filePath)) {
      return createResult(filePath, false, 'File does not exist');
    }

    // Check if it's a JS/TS file
    if (!isJavaScriptOrTypeScript(filePath)) {
      return createResult(filePath, false, 'Not a JavaScript/TypeScript file');
    }

    // Skip new files - they don't have a previous version to compare
    if (isNewFile(filePath, { cwd: config.cwd })) {
      return createResult(filePath, false, 'File is newly added, skipping analysis');
    }

    // Get current file content
    const currentContent = readFile(filePath);

    // Get previous file content from git
    const previousContent = getFileContentAtRef(filePath, { cwd: config.cwd });

    // Parse both versions and compare ASTs without comments
    const currentAst = parseWithoutComments(filePath, currentContent);
    const previousAst = parseWithoutComments(filePath, previousContent);

    // Compare ASTs
    const astEqual = deepEqual(currentAst, previousAst);

    if (astEqual) {
      return createResult(
        filePath,
        true,
        'File has only comment changes based on AST comparison'
      );
    } else {
      return createResult(
        filePath,
        false,
        'File has code changes beyond comments'
      );
    }
  } catch (error) {
    return createResult(
      filePath,
      false,
      'Failed to perform AST comparison',
      error instanceof Error ? error.message : String(error)
    );
  }
};
