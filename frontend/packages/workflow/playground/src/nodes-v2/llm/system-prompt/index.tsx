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

import React, { useCallback } from 'react';

import { useForm, useRefresh } from '@flowgram-adapter/free-layout-editor';
import type { ILibraryItem } from '@coze-common/editor-plugins/library-insert';
import type { InputValueVO } from '@coze-workflow/base';

import { addSKillFromLibrary } from '@/nodes-v2/llm/utils';

import type { BoundSkills } from '../skills/types';
import {
  SystemPrompt as DefaultSystemPrompt,
  type SystemPromptProps,
} from '../../components/system-prompt';
import useSkillLibraries from './use-skill-libraries';

interface Props extends Omit<SystemPromptProps, 'libraries'> {
  inputParameters?: InputValueVO[];
  fcParam?: BoundSkills;
  placeholder?: string;
}

export const SystemPrompt = (props: Props) => {
  const { placeholder, inputParameters, fcParam, onAddLibrary, ...rest } =
    props;

  const form = useForm();
  const refresh = useRefresh();

  const { libraries, refetch } = useSkillLibraries({ fcParam });

  const handleAddLibrary = useCallback(
    (library: ILibraryItem) => {
      form.setValueIn(
        'fcParam',
        addSKillFromLibrary(library, form.getValueIn('fcParam')),
      );

      refresh();

      setTimeout(() => {
        refetch();
      }, 10);
    },
    [onAddLibrary],
  );

  return (
    <DefaultSystemPrompt
      {...rest}
      onAddLibrary={handleAddLibrary}
      libraries={libraries}
      placeholder={placeholder}
      inputParameters={inputParameters}
    />
  );
};
