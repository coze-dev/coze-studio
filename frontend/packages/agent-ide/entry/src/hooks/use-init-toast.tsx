import { useEffect } from 'react';

import queryString from 'query-string';
import { I18n } from '@coze-arch/i18n';
import { Toast, Space, Typography, Button } from '@coze-arch/coze-design';
import { appendUrlParam } from '@coze-arch/bot-utils';
import { ProductEntityType } from '@coze-arch/bot-api/product_api';
import { useNavigate } from 'react-router-dom';
const { Text } = Typography;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useInitToast = (spaceId: any) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!spaceId) {
      return;
    }
    const queryParams = queryString.parse(location.search);
    const { show_toast, entity_id, toast_entity_type } = queryParams || {};

    if (show_toast === 'workflow_copy_success') {
      Toast.success({
        content: (
          <Space spacing={6}>
            <Text>
              {Number(toast_entity_type as string) ===
              ProductEntityType.ImageflowTemplate
                ? I18n.t('imageflow_detail_toast_createcopy_succeed')
                : I18n.t('workflowstore_workflow_copy_successful')}
            </Text>
            <Button
              color="primary"
              onClick={() => {
                window.open(
                  `/work_flow?space_id=${spaceId}&workflow_id=${entity_id}`,
                );
              }}
            >
              {I18n.t('workflowstore_continue_editing')}
            </Button>
          </Space>
        ),
      });

      const url = appendUrlParam(location.href, 'show_toast', undefined);
      navigate(url.slice(`${location.protocol}//${location.host}`.length), {
        replace: true,
      });
    }
  }, [spaceId]);
};
