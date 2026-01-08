import { Rule, RuleAnalyzer } from '../types';
import { WHITESPACE_RULE, analyzeWhitespaceRule } from './whitespace-rule';
import { AST_COMMENT_RULE, analyzeAstCommentRule } from './ast-comment-rule';

/**
 * Registry of all available rules with their analyzers
 */
export interface RuleDefinition {
  rule: Rule;
  analyzer: RuleAnalyzer;
}

/**
 * All available rules with their analysis functions
 */
export const AVAILABLE_RULES: readonly RuleDefinition[] = [
  { rule: WHITESPACE_RULE, analyzer: analyzeWhitespaceRule },
  { rule: AST_COMMENT_RULE, analyzer: analyzeAstCommentRule }
] as const;

/**
 * Get all available rules
 */
export const getAllRules = (): readonly RuleDefinition[] => {
  return AVAILABLE_RULES;
};

/**
 * Get rules that apply to a specific file
 */
export const getRulesForFile = (filePath: string): readonly RuleDefinition[] => {
  return AVAILABLE_RULES.filter(({ rule }) =>
    rule.filePatterns.some(pattern => matchesPattern(filePath, pattern))
  );
};

/**
 * Get a rule by name
 */
export const getRuleByName = (name: string): RuleDefinition | undefined => {
  return AVAILABLE_RULES.find(({ rule }) => rule.name === name);
};

/**
 * Simple pattern matching logic
 */
const matchesPattern = (filePath: string, pattern: string): boolean => {
  if (pattern === '**/*') return true;

  // Simple extension matching for patterns like '**/*.ts'
  const extensionMatch = pattern.match(/\*\*\/\*\.(\w+)$/);
  if (extensionMatch && extensionMatch[1]) {
    return filePath.endsWith(`.${extensionMatch[1]}`);
  }

  // More complex pattern matching could be implemented here
  return false;
};

// Re-export rule constants and analyzers for convenience
export { WHITESPACE_RULE, analyzeWhitespaceRule } from './whitespace-rule';
export { AST_COMMENT_RULE, analyzeAstCommentRule } from './ast-comment-rule';