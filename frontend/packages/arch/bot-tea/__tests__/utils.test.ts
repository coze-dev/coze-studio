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

import { describe, it, expect } from 'vitest';
import { ProductEntityType } from '@coze-arch/bot-api/product_api';

import {
  convertTemplateType,
  extractTemplateActionCommonParams,
} from '../src/utils';

describe('utils', () => {
  describe('convertTemplateType', () => {
    it('should convert workflow template type', () => {
      expect(convertTemplateType(ProductEntityType.WorkflowTemplateV2)).toBe(
        'workflow',
      );
    });

    it('should convert imageflow template type', () => {
      expect(convertTemplateType(ProductEntityType.ImageflowTemplateV2)).toBe(
        'imageflow',
      );
    });

    it('should convert bot template type', () => {
      expect(convertTemplateType(ProductEntityType.BotTemplate)).toBe('bot');
    });

    it('should convert project template type', () => {
      expect(convertTemplateType(ProductEntityType.ProjectTemplate)).toBe(
        'project',
      );
    });

    it('should return unknown for undefined type', () => {
      expect(convertTemplateType(undefined)).toBe('unknown');
    });

    it('should return unknown for unrecognized type', () => {
      expect(convertTemplateType('invalid' as any)).toBe('unknown');
    });
  });

  describe('extractTemplateActionCommonParams', () => {
    it('should extract params from workflow template', () => {
      const mockDetail = {
        meta_info: {
          id: 'test-id',
          entity_id: 'entity-id',
          name: 'Test Template',
          entity_type: ProductEntityType.WorkflowTemplateV2,
          is_professional: true,
          is_free: true,
        },
      };

      expect(extractTemplateActionCommonParams(mockDetail)).toEqual({
        template_id: 'test-id',
        entity_id: 'entity-id',
        template_name: 'Test Template',
        template_type: 'workflow',
        template_tag_professional: 'professional',
        template_tag_prize: 'free',
        from: '',
      });
    });

    it('should extract params from paid template', () => {
      const mockDetail = {
        meta_info: {
          id: 'test-id',
          entity_id: 'entity-id',
          name: 'Test Template',
          entity_type: ProductEntityType.BotTemplate,
          is_professional: false,
          is_free: false,
          price: {
            amount: '100',
          },
        },
      };

      expect(extractTemplateActionCommonParams(mockDetail)).toEqual({
        template_id: 'test-id',
        entity_id: 'entity-id',
        template_name: 'Test Template',
        template_type: 'bot',
        template_tag_professional: 'basic',
        template_tag_prize: 'paid',
        template_prize_detail: 100,
        from: '',
      });
    });

    it('should extract params from project template', () => {
      const mockDetail = {
        meta_info: {
          id: 'test-id',
          entity_id: 'entity-id',
          name: 'Test Template',
          entity_type: ProductEntityType.ProjectTemplate,
          is_professional: false,
          is_free: true,
        },
        project_extra: {
          template_project_id: 'project-id',
        },
      };

      expect(extractTemplateActionCommonParams(mockDetail)).toEqual({
        template_id: 'test-id',
        entity_id: 'entity-id',
        template_name: 'Test Template',
        template_type: 'project',
        entity_copy_id: 'project-id',
        template_tag_professional: 'basic',
        template_tag_prize: 'free',
        from: '',
      });
    });

    it('should handle undefined detail', () => {
      expect(extractTemplateActionCommonParams(undefined)).toEqual({
        template_id: '',
        entity_id: '',
        template_name: '',
        template_type: 'unknown',
        template_tag_professional: 'basic',
        template_tag_prize: 'paid',
        template_prize_detail: 0,
        from: '',
      });
    });

    it('should handle missing price amount', () => {
      const mockDetail = {
        meta_info: {
          id: 'test-id',
          entity_id: 'entity-id',
          name: 'Test Template',
          entity_type: ProductEntityType.BotTemplate,
          is_professional: false,
          is_free: false,
          price: {},
          from: '',
        },
      };

      expect(extractTemplateActionCommonParams(mockDetail)).toEqual({
        template_id: 'test-id',
        entity_id: 'entity-id',
        template_name: 'Test Template',
        template_type: 'bot',
        template_tag_professional: 'basic',
        template_tag_prize: 'paid',
        template_prize_detail: 0,
        from: '',
      });
    });
  });
});
