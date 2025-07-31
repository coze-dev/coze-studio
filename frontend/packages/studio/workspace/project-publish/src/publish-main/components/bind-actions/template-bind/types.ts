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

import { ProductStatus, type EntityInfoData } from '@coze-arch/idl/product_api';
import { type UIOption } from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { type FileItem } from '@coze-arch/bot-semi/Upload';

import {
  type DisplayScreen,
  toDisplayScreenOption,
} from '@/publish-main/utils/display-screen-option';

export interface TemplateBindInfo {
  title: string;
  cover_uri: string;
  description: string;
  readme: string;
  display_screen: DisplayScreen;
  category_id: string;
  [k: string]: string;
}

export interface TemplateForm {
  agreement: boolean;
  name: string;
  covers: Partial<FileItem>[];
  description: string;
  // EditorFullInput plain text form value, only to meet the type requirements, not used in business
  readme_text: string;
  // The editor-kit rich text content that actually needs to be passed to the backend
  readme: string;
  preview_type: DisplayScreen;
  category: string;
}

function stringToDeltaSet(str?: string) {
  if (!str) {
    return '';
  }
  return `{"0":{"ops":[{"insert":"${str}\\n"}],"zoneId":"0","zoneType":"Z"}}`;
}

export function entityInfoToTemplateForm(
  info: EntityInfoData,
  uiOption?: UIOption,
): Partial<TemplateForm> {
  const isZh = I18n.language.startsWith('zh');
  const meta = info.meta_info ?? {};
  const form: Partial<TemplateForm> = {
    // By default, check Agree to the template payment agreement: already on the shelves, or already configured template information (readme is not empty)
    agreement: meta.status !== ProductStatus.NeverListed || meta.readme !== '',
    name: meta.name,
    covers: meta.covers?.map(c => ({
      url: c.url,
      response: c,
      // Supplements other properties of FileItem for form validation
      status: 'success',
      _sizeInvalid: false,
    })),
    description: meta.description?.substring(0, isZh ? 100 : 300),
    readme: meta.readme || stringToDeltaSet(meta.description),
    category: meta.category?.id,
  };
  if (uiOption) {
    form.preview_type = toDisplayScreenOption(uiOption).value;
  }
  return form;
}

export function templateFormToBindInfo(form: TemplateForm): TemplateBindInfo {
  return {
    title: form.name,
    cover_uri: form.covers?.[0].response?.uri ?? '',
    description: form.description,
    readme: form.readme,
    display_screen: form.preview_type,
    category_id: form.category ?? '',
  };
}
