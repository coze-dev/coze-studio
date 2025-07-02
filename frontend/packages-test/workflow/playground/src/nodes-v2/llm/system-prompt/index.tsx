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
