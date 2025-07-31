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

import {
  InputType,
  // eslint-disable-next-line camelcase
  type shortcut_command,
} from '@coze-arch/bot-api/playground_api';

import {
  type ComponentsWithId,
  type ComponentTypeItem,
} from '../../../../../src/shortcut-tool/shortcut-edit/components-table/types';
import {
  attachIdToComponents,
  checkDuplicateName,
  formatSubmitValues,
  getComponentTypeFormBySubmitField,
  getComponentTypeSelectFormInitValues,
  getSubmitFieldFromComponentTypeForm,
  isUploadType,
  modifyComponentWhenSwitchChange,
  type SubmitComponentTypeFields,
} from '../../../../../src/shortcut-tool/shortcut-edit/components-table/method';

describe('attachIdToComponents', () => {
  it('should attach unique id to each component', () => {
    // eslint-disable-next-line camelcase
    const components: shortcut_command.Components[] = [
      { input_type: InputType.TextInput },
      { input_type: InputType.Select },
    ];
    const result = attachIdToComponents(components);
    expect(result[0]?.id).toBeDefined();
    expect(result[1]?.id).toBeDefined();
    expect(result[0]?.id).not.toEqual(result[1]?.id);
  });
});

describe('formatSubmitValues', () => {
  it('should format values correctly', () => {
    const values: ComponentsWithId[] = [
      { id: '1', input_type: InputType.TextInput, options: ['option1'] },
      {
        id: '2',
        input_type: InputType.Select,
        options: ['option1', 'option2'],
      },
    ];
    const result = formatSubmitValues(values);
    expect(result[0]?.options).toEqual([]);
    expect(result[1]?.options).toEqual(['option1', 'option2']);
  });
});

describe('checkDuplicateName', () => {
  it('should return true if duplicate names exist', () => {
    const values: ComponentsWithId[] = [
      { id: '1', name: 'component1' },
      { id: '2', name: 'component1' },
    ];
    const formApi = { setError: vi.fn() };
    const result = checkDuplicateName(values, formApi as any);
    expect(result).toBe(true);
  });

  it('should return false if no duplicate names exist', () => {
    const values: ComponentsWithId[] = [
      { id: '1', name: 'component1' },
      { id: '2', name: 'component2' },
    ];
    const formApi = { setError: vi.fn() };
    const result = checkDuplicateName(values, formApi as any);
    expect(result).toBe(false);
  });
});

describe('getComponentTypeSelectFormInitValues', () => {
  it('should return initial values', () => {
    const result = getComponentTypeSelectFormInitValues();
    expect(result).toEqual({ type: 'text' });
  });
});

describe('getSubmitFieldFromComponentTypeForm', () => {
  it('returns TextInput type for text', () => {
    const values: ComponentTypeItem = { type: 'text' };
    const result = getSubmitFieldFromComponentTypeForm(values);
    expect(result).toEqual({ input_type: InputType.TextInput });
  });

  it('returns Select type with options for select', () => {
    const values: ComponentTypeItem = {
      type: 'select',
      options: ['option1', 'option2'],
    };
    const result = getSubmitFieldFromComponentTypeForm(values);
    expect(result).toEqual({
      input_type: InputType.Select,
      options: ['option1', 'option2'],
    });
  });

  it('returns MixUpload type with upload options for multiple upload types', () => {
    const values: ComponentTypeItem = {
      type: 'upload',
      uploadTypes: [InputType.UploadImage, InputType.UploadDoc],
    };
    const result = getSubmitFieldFromComponentTypeForm(values);
    expect(result).toEqual({
      input_type: InputType.MixUpload,
      upload_options: [InputType.UploadImage, InputType.UploadDoc],
    });
  });

  it('returns specific Upload type for single upload type', () => {
    const values: ComponentTypeItem = {
      type: 'upload',
      uploadTypes: [InputType.UploadImage],
    };
    const result = getSubmitFieldFromComponentTypeForm(values);
    expect(result).toEqual({ input_type: InputType.UploadImage });
  });

  it('returns TextInput type for unrecognized type', () => {
    // @ts-expect-error -- ignore
    const values: ComponentTypeItem = { type: 'unknown' };
    const result = getSubmitFieldFromComponentTypeForm(values);
    expect(result).toEqual({ input_type: InputType.TextInput });
  });
});

describe('isUploadType', () => {
  it('should return true for upload types', () => {
    const result = isUploadType(InputType.UploadImage);
    expect(result).toBe(true);
  });

  it('should return false for non-upload types', () => {
    const result = isUploadType(InputType.TextInput);
    expect(result).toBe(false);
  });
});

describe('getComponentTypeFormBySubmitField', () => {
  it('returns initial values when input_type is not provided', () => {
    const values: SubmitComponentTypeFields = {};
    const result = getComponentTypeFormBySubmitField(values);
    expect(result).toEqual({ type: 'text' });
  });

  it('returns correct form for TextInput type', () => {
    const values: SubmitComponentTypeFields = {
      input_type: InputType.TextInput,
    };
    const result = getComponentTypeFormBySubmitField(values);
    expect(result).toEqual({ type: 'text' });
  });

  it('returns correct form for Select type with options', () => {
    const values: SubmitComponentTypeFields = {
      input_type: InputType.Select,
      options: ['option1', 'option2'],
    };
    const result = getComponentTypeFormBySubmitField(values);
    expect(result).toEqual({ type: 'select', options: ['option1', 'option2'] });
  });

  it('returns correct form for Upload type with upload options', () => {
    const values: SubmitComponentTypeFields = {
      input_type: InputType.UploadImage,
      upload_options: [InputType.UploadAudio, InputType.VIDEO],
    };
    const result = getComponentTypeFormBySubmitField(values);
    expect(result).toEqual({
      type: 'upload',
      uploadTypes: [InputType.UploadAudio, InputType.VIDEO],
    });
  });

  it('returns initial values when input_type is not recognized', () => {
    const values: SubmitComponentTypeFields = {
      input_type: 'unknown' as unknown as InputType,
    };
    const result = getComponentTypeFormBySubmitField(values);
    expect(result).toEqual({ type: 'text' });
  });
});

describe('isUploadType', () => {
  it('returns true for upload types', () => {
    expect(isUploadType(InputType.UploadImage)).toBeTruthy();
    expect(isUploadType(InputType.UploadDoc)).toBeTruthy();
    expect(isUploadType(InputType.UploadTable)).toBeTruthy();
    expect(isUploadType(InputType.UploadAudio)).toBeTruthy();
    expect(isUploadType(InputType.CODE)).toBeTruthy();
    expect(isUploadType(InputType.ARCHIVE)).toBeTruthy();
    expect(isUploadType(InputType.PPT)).toBeTruthy();
    expect(isUploadType(InputType.VIDEO)).toBeTruthy();
    expect(isUploadType(InputType.TXT)).toBeTruthy();
    expect(isUploadType(InputType.MixUpload)).toBeTruthy();
  });

  it('returns false for non-upload types', () => {
    expect(isUploadType(InputType.TextInput)).toBeFalsy();
    expect(isUploadType(InputType.Select)).toBeFalsy();
  });
});
describe('modifyComponentWhenSwitchChange', () => {
  it('should modify component hide property correctly', () => {
    const components: ComponentsWithId[] = [
      { id: '1', hide: false },
      { id: '2', hide: false },
    ];
    const record: ComponentsWithId = { id: '1', hide: false };
    const result = modifyComponentWhenSwitchChange({
      components,
      record,
      checked: false,
    });
    expect(result[0]?.hide).toBe(true);
    expect(result[1]?.hide).toBe(false);
  });
});
