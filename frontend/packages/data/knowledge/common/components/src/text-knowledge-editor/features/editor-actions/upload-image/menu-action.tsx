import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozImage } from '@coze-arch/coze-design/icons';
import { Menu } from '@coze-arch/coze-design';

import { BaseUploadImage, type BaseUploadImageProps } from './base';

export const UploadImageMenu = (
  props: Omit<BaseUploadImageProps, 'renderUI'>,
) => (
  <BaseUploadImage
    {...props}
    renderUI={({ disabled }) => (
      <Menu.Item
        disabled={disabled}
        icon={
          <IconCozImage
            className={classNames('w-3.5 h-3.5', {
              'opacity-30': disabled,
            })}
          />
        }
        className={classNames('h-8 p-2 text-xs rounded-lg', {
          'cursor-not-allowed': disabled,
        })}
      >
        {I18n.t('knowledge_insert_img_002')}
      </Menu.Item>
    )}
  />
);
