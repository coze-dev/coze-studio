import { type FC } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Button, Space } from '@coze/coze-design';

import { PATInstructionWrap } from '@/components/instructions-wrap';

export const TopBody: FC<{
  openAddModal: () => void;
}> = ({ openAddModal }) => (
  <Space vertical spacing={20}>
    <Space className="w-full">
      <h3 className="flex-1 m-0">{I18n.t('auth_tab_pat')}</h3>
      <Button onClick={openAddModal} theme="solid" type="primary">
        {I18n.t('add_new_token_button_1')}
      </Button>
    </Space>
    <div className="w-full">
      <PATInstructionWrap
        onClick={() => {
          window.open(
            IS_OVERSEA
              ? // cp-disable-next-line
                'https://www.coze.com/open/docs/developer_guides/coze_api_overview'
              : // cp-disable-next-line
                'https://www.coze.cn/open/docs/developer_guides/coze_api_overview',
          );
        }}
      />
    </div>
  </Space>
);
