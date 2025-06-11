import { get } from 'lodash-es';
import { useWorkflowNode } from '@coze-workflow/base';
import { I18n, type I18nKeysNoOptionsType } from '@coze-arch/i18n';

import { Field, OverflowTagList } from '../../fields';
import { Icon } from './icon';
import thumbnail7 from './assets/reference-7.png';
import thumbnail6 from './assets/reference-6.jpg';
import thumbnail5 from './assets/reference-5.jpg';
import thumbnail4 from './assets/reference-4.jpg';
import thumbnail3 from './assets/reference-3.jpg';
import thumbnail2 from './assets/reference-2.jpg';
import thumbnail1 from './assets/reference-1.jpg';

const thumbnails = [
  thumbnail1,
  thumbnail2,
  thumbnail3,
  thumbnail4,
  thumbnail5,
  thumbnail6,
  thumbnail7,
];

export function References() {
  const { data } = useWorkflowNode();

  const references = (
    get(data, 'references') || get(data, 'inputs.references')
  )?.filter(({ preprocessor }) => preprocessor !== undefined);

  return (
    <Field
      contentClassName="flex gap-[6px]"
      label={I18n.t('Imageflow_reference_image')}
      isEmpty={!references || references.length === 0}
    >
      <OverflowTagList
        value={references?.map(({ preprocessor }) => ({
          label: I18n.t(
            `Imageflow_reference${preprocessor}` as I18nKeysNoOptionsType,
          ),
          icon: <Icon src={thumbnails[preprocessor - 1]} />,
        }))}
      />
    </Field>
  );
}
