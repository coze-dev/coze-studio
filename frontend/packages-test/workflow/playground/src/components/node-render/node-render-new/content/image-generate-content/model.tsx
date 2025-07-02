import { get } from 'lodash-es';
import { useWorkflowNode } from '@coze-workflow/base';
import { I18n, type I18nKeysNoOptionsType } from '@coze-arch/i18n';

import { Field, OverflowTagList } from '../../fields';
import { Icon } from './icon';
import thumbnail8 from './assets/8.png';
import thumbnail7 from './assets/7.jpg';
import thumbnail6 from './assets/6.jpg';
import thumbnail5 from './assets/5.jpg';
import thumbnail4 from './assets/4.jpg';
import thumbnail3 from './assets/3.jpg';
import thumbnail2 from './assets/2.jpg';
import thumbnail1 from './assets/1.jpg';

const thumbnails = [
  thumbnail1,
  thumbnail2,
  thumbnail3,
  thumbnail4,
  thumbnail5,
  thumbnail6,
  thumbnail7,
  thumbnail8,
];

export function Model() {
  const { data } = useWorkflowNode();
  // 组件化表单字段name支持点语法 新版一般从inputs开始 这里需要兼容老版
  const model =
    get(data, 'modelSetting.model') || get(data, 'inputs.modelSetting.model');

  return (
    <Field label={I18n.t('Imageflow_model')} isEmpty={!model}>
      <OverflowTagList
        value={[
          {
            label: I18n.t(`Imageflow_model${model}` as I18nKeysNoOptionsType),
            icon: <Icon src={thumbnails[model - 1]} />,
          },
        ]}
      />
    </Field>
  );
}
