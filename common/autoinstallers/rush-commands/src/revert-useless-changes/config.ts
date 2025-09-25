import { Config } from './types';

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: Omit<Config, 'cwd'> = {
  dryRun: false,
  verbose: false,
  json: false,
  exclude: [
    'node_modules/**',
    '.git/**',
    'tmp/**',
    '**/*.log',
    '**/.DS_Store',
    '**/dist/**',
    '**/build/**',
    '**/lib/**',
  ]
};

/**
 * File patterns for different rule types
 */
export const FILE_PATTERNS = {
  TYPESCRIPT_JAVASCRIPT: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
  ALL_FILES: ['**/*'],
} as const;

/**
 * Constants for the tool
 */
export const CONSTANTS = {
  TOOL_NAME: 'revert-useless-changes',
  VERSION: '1.0.0',
  DEFAULT_GIT_REF: 'HEAD',
} as const;