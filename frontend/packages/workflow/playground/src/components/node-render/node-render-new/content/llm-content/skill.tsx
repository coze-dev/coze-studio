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

import { I18n } from '@coze-arch/i18n';

import { Field } from '../../fields/field';
import { useSkillTags } from './use-skill-tags';
import { SkillTags } from './skill-tags';

interface Props {
  label?: string;
}

export function Skill({ label = I18n.t('debug_skills') }: Props) {
  const skillTags = useSkillTags();

  const isEmpty = !skillTags || skillTags.length === 0;

  return (
    <Field label={label} isEmpty={isEmpty}>
      <SkillTags skillTags={skillTags} />
    </Field>
  );
}
