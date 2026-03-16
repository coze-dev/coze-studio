import { readFileSync, existsSync, statSync } from 'fs';
import { join, relative, isAbsolute } from 'path';
import { glob } from 'glob';

/**
 * Read file content safely
 */
export const readFile = (filePath: string): string => {
  try {
    return readFileSync(filePath, 'utf8');
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Check if file exists
 */
export const exists = (filePath: string): boolean => {
  return existsSync(filePath);
};

/**
 * Convert relative path to absolute path
 */
export const toAbsolutePath = (filePath: string, basePath: string): string => {
  if (isAbsolute(filePath)) {
    return filePath;
  }
  return join(basePath, filePath);
};

/**
 * Convert absolute path to relative path
 */
export const toRelativePath = (filePath: string, basePath: string): string => {
  return relative(basePath, filePath);
};

/**
 * Match files against glob patterns
 */
export const matchFiles = (patterns: string[], options: { cwd: string; exclude?: string[] }): string[] => {
  const allMatches: string[] = [];

  for (const pattern of patterns) {
    try {
      const matches = glob.sync(pattern, {
        cwd: options.cwd,
        absolute: true,
        ignore: options.exclude || [],
        nodir: true
      });
      allMatches.push(...matches);
    } catch (error) {
      console.warn(`Warning: Failed to match pattern ${pattern}:`, error);
    }
  }

  // Remove duplicates
  return Array.from(new Set(allMatches));
};

/**
 * Check if a file matches any of the given patterns
 */
export const matchesPattern = (filePath: string, patterns: string[]): boolean => {
  return patterns.some(pattern => {
    if (pattern === '**/*') return true;

    // Simple extension matching for patterns like '**/*.ts'
    const extensionMatch = pattern.match(/\*\*\/\*\.(\w+)$/);
    if (extensionMatch && extensionMatch[1]) {
      return filePath.endsWith(`.${extensionMatch[1]}`);
    }

    // More complex pattern matching could be implemented here
    // For now, we'll use simple string matching
    return filePath.includes(pattern.replace(/\*\*/g, '').replace(/\*/g, ''));
  });
};

/**
 * Get file extension
 */
export const getExtension = (filePath: string): string => {
  const lastDot = filePath.lastIndexOf('.');
  if (lastDot === -1 || lastDot === 0) return '';
  return filePath.substring(lastDot + 1);
};

/**
 * Check if file is a JavaScript/TypeScript file
 */
export const isJavaScriptOrTypeScript = (filePath: string): boolean => {
  const ext = getExtension(filePath).toLowerCase();
  return ['js', 'jsx', 'ts', 'tsx'].includes(ext);
};

/**
 * Get file size in bytes
 */
export const getFileSize = (filePath: string): number => {
  try {
    const stats = statSync(filePath);
    return stats.size;
  } catch {
    return 0;
  }
};