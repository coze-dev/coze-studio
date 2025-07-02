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
