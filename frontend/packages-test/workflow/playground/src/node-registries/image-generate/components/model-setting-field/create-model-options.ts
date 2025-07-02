import { I18n, type I18nKeysNoOptionsType } from '@coze-arch/i18n';

import thumbnail8 from '../../assets/8.png';
import thumbnail7 from '../../assets/7.jpg';
import thumbnail6 from '../../assets/6.jpg';
import thumbnail5 from '../../assets/5.jpg';
import thumbnail4 from '../../assets/4.jpg';
import thumbnail3 from '../../assets/3.jpg';
import thumbnail2 from '../../assets/2.jpg';
import thumbnail1 from '../../assets/1.jpg';

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

export function createModelOptions() {
  let models = [1, 8, 2, 3, 4, 5, 6, 7];

  if (IS_OVERSEA) {
    models = models.filter(model => ![6].includes(model));
  }

  return models.map(model => ({
    label: I18n.t(`Imageflow_model${model}` as I18nKeysNoOptionsType),
    value: model,
    thumbnail: thumbnails[model - 1],
  }));
}
