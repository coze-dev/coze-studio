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

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { type FormItemMaterialContext } from '@flowgram-adapter/free-layout-editor';
import { I18n } from '@coze-arch/i18n';

import { nodeMetaValidator } from '../node-meta-validator';

// Simulation I18n.t method
vi.mock('@coze-arch/i18n', () => ({
  I18n: { t: vi.fn(key => `translated_${key}`) },
}));

const mockNodesService = {
  getAllNodes: vi.fn(),
  getNodeTitle: vi.fn(node => node.title),
};

const baseContext = {
  playgroundContext: {
    nodesService: mockNodesService,
  },
} as FormItemMaterialContext;

describe('nodeMetaValidator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return true for valid metadata with a unique title', () => {
    mockNodesService.getAllNodes.mockReturnValue([
      { id: 'node2', title: 'AnotherNode' },
    ]);
    const result = nodeMetaValidator({
      value: { title: 'ValidTitle' },
      context: baseContext,
      options: {},
    });
    expect(result).toBe(true);
  });

  it('should return an error string for an empty title', () => {
    // Ensure isTitleRepeated returns false to isolate schema validation
    mockNodesService.getAllNodes.mockReturnValue([]);
    const result = nodeMetaValidator({
      value: { title: '' },
      context: baseContext,
      options: {},
    });
    // The I18n.t mock for 'workflow_detail_node_name_error_empty' is associated with the .string({...}) definition.
    // This key is used when Zod creates the error message for the .min(1) rule.
    // The I18n.t call for 'workflow_node_title_duplicated' happens inside nodeMetaValidator
    // when the refine schema is built.
    expect(I18n.t).toHaveBeenCalledWith('workflow_node_title_duplicated');
    const parsedResult = JSON.parse(result as string);
    expect(parsedResult.issues[0].message).toBe(
      I18n.t('workflow_detail_node_name_error_empty'),
    );
    expect(parsedResult.issues[0].path).toEqual(['title']);
  });

  it('should return an error string for a title exceeding max length', () => {
    // Ensure isTitleRepeated returns false to isolate schema validation
    mockNodesService.getAllNodes.mockReturnValue([]);
    const longTitle = 'a'.repeat(64);
    const result = nodeMetaValidator({
      value: { title: longTitle },
      context: baseContext,
      options: {},
    });
    // The I18n.t mock for 'workflow_derail_node_detail_title_max' is associated with the .regex({...}) definition.
    // This key is used when Zod creates the error message for the regex rule.
    // The I18n.t call for 'workflow_node_title_duplicated' happens inside nodeMetaValidator
    // when the refine schema is built.
    expect(I18n.t).toHaveBeenCalledWith('workflow_node_title_duplicated');
    const parsedResult = JSON.parse(result as string);
    expect(parsedResult.issues[0].message).toBe(
      I18n.t('workflow_derail_node_detail_title_max', { max: '63' }),
    );
    expect(parsedResult.issues[0].path).toEqual(['title']);
  });

  it('should return an error string for a duplicated title', () => {
    mockNodesService.getAllNodes.mockReturnValue([
      { id: 'node1', title: 'ExistingTitle' },
      { id: 'node2', title: 'AnotherNode' },
      { id: 'node2', title: 'ExistingTitle' }, // Here a repeating title is simulated.
    ]);
    const result = nodeMetaValidator({
      value: { title: 'ExistingTitle' },
      context: baseContext,
      options: {},
    });
    // The validator returns a stringified Zod error object when parsed.success is false.
    // The 'workflow_node_title_duplicated' message comes from the refine function.
    const parsedResult = JSON.parse(result as string);
    expect(parsedResult.issues[0].message).toBe(
      I18n.t('workflow_node_title_duplicated'),
    );
    expect(parsedResult.issues[0].path).toEqual(['title']);
    // Ensure I18n.t was called for the duplication message within the refine logic.
    expect(I18n.t).toHaveBeenCalledWith('workflow_node_title_duplicated');
  });

  it('should return true for valid metadata with optional fields', () => {
    mockNodesService.getAllNodes.mockReturnValue([]);
    const result = nodeMetaValidator({
      value: {
        title: 'ValidTitleWithExtras',
        icon: 'icon.png',
        subtitle: 'A subtitle',
        description: 'A description',
      },
      context: baseContext,
      options: {},
    });
    expect(result).toBe(true);
  });

  it('should return true if title is empty when checking for duplicates (isTitleRepeated returns false)', () => {
    // isTitleRepeated returns false if title is empty, so it should pass this specific check
    // but it will fail the .min(1) check from Zod schema
    mockNodesService.getAllNodes.mockReturnValue([
      { id: 'node1', title: 'ExistingTitle' },
    ]);
    const result = nodeMetaValidator({
      value: { title: '' }, // Empty title
      context: baseContext,
      options: {},
    });
    // This will fail the zod schema's .min(1) check first
    const parsedResult = JSON.parse(result as string);
    expect(parsedResult.issues[0].message).toBe(
      'translated_workflow_detail_node_name_error_empty',
    );
  });

  it('should correctly handle nodesService.getNodeTitle returning different structure if applicable', () => {
    // This test is to ensure getNodeTitle mock is robust or to highlight if it needs adjustment
    // For example, if getNodeTitle actually expects a more complex node object
    const mockComplexNode = { id: 'nodeC', data: { name: 'ComplexNodeTitle' } };
    mockNodesService.getAllNodes.mockReturnValue([mockComplexNode]);
    // Adjusting the mock for getNodeTitle if it's more complex than just node.title
    const originalGetNodeTitle = mockNodesService.getNodeTitle;
    mockNodesService.getNodeTitle = vi.fn(node => node.data.name);

    const result = nodeMetaValidator({
      value: { title: 'TestComplex' },
      context: baseContext,
      options: {},
    });
    expect(result).toBe(true);

    // Restore original mock
    mockNodesService.getNodeTitle = originalGetNodeTitle;
  });

  it('should return true when title is not duplicated and nodes exist', () => {
    mockNodesService.getAllNodes.mockReturnValue([
      { id: 'node1', title: 'AnotherTitle1' },
      { id: 'node2', title: 'AnotherTitle2' },
    ]);
    const result = nodeMetaValidator({
      value: { title: 'UniqueTitle' },
      context: baseContext,
      options: {},
    });
    expect(result).toBe(true);
  });

  it('should handle when getAllNodes returns an empty array (no nodes)', () => {
    mockNodesService.getAllNodes.mockReturnValue([]);
    const result = nodeMetaValidator({
      value: { title: 'FirstNodeTitle' },
      context: baseContext,
      options: {},
    });
    expect(result).toBe(true);
  });
});
