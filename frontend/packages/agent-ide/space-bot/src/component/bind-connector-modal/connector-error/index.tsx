import {
  type BindConnectorResponse,
  type GetBindConnectorConfigResponse,
  type SaveBindConnectorConfigResponse,
} from '@coze-arch/idl/developer_api';
import { I18n } from '@coze-arch/i18n';
import { Form, Typography } from '@coze-arch/bot-semi';
import { type ApiError } from '@coze-arch/bot-http';

import styles from './index.module.less';

type ErrorResponse =
  | GetBindConnectorConfigResponse
  | SaveBindConnectorConfigResponse
  | BindConnectorResponse;

function isBindConnectorResponse(
  res: ErrorResponse,
): res is BindConnectorResponse {
  return ['bind_bot_id', 'bind_bot_name', 'bind_space_id'].every(
    key => key in res,
  );
}

export interface ConnectorErrorProps {
  errorMessage: ApiError;
}

export const ConnectorError = ({ errorMessage }: ConnectorErrorProps) => {
  const res = (errorMessage?.raw ?? {}) as ErrorResponse;

  return (
    <Form.ErrorMessage
      error={
        isBindConnectorResponse(res) ? (
          <div className={styles['error-link']}>
            {I18n.t('bot_publish_bind_error', {
              bot_name: (
                <Typography.Text
                  className={styles['error-link-underline']}
                  link={{
                    href: `/space/${res.bind_space_id}/${res.bind_agent_type === 1 ? 'project-ide' : 'bot'}/${res.bind_bot_id}`,
                  }}
                  ellipsis={{
                    showTooltip: {
                      opts: {
                        content: res.bind_bot_name,
                      },
                    },
                  }}
                >
                  {res.bind_bot_name}
                </Typography.Text>
              ),
              key_name: 'token',
            })}
          </div>
        ) : (
          errorMessage?.msg
        )
      }
      className={styles['error-container']}
    />
  );
};
