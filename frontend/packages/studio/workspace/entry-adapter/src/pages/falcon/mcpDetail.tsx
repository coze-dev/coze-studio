/* eslint-disable @coze-arch/max-line-per-function */
/* eslint-disable prettier/prettier */
import { useEffect, useCallback, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { I18n } from '@coze-arch/i18n';
import { Button, Breadcrumb, Form, Spin, Toast } from '@coze-arch/coze-design';
import { getParamsFromQuery } from '../../../../../../arch/bot-utils';
import { useParams } from 'react-router-dom';
import {
  IconCozArrowLeft,
  IconCozWarningCircleFill,
} from '@coze-arch/coze-design/icons';
import {
  Content,
  Header,
  SubHeaderSearch,
  HeaderTitle,
  SubHeaderFilters,
  Layout,
  SubHeader,
  HeaderActions,
  type DevelopProps,
} from '@coze-studio/workspace-base/develop';
import { IconCozPlus } from '@coze-arch/coze-design/icons';

import cls from 'classnames';
import { replaceUrl, parseUrl, installTypeOptions } from './utils';
import { aopApi } from '@coze-arch/bot-api';

import styles from './index.module.less';

export const FalconMcpDetail = ({ spaceId }) => {
  const valueWidth = '560px';
  const { page_type } = useParams();
  const mcpId = getParamsFromQuery({ key: 'mcp_id' });
  const [loading, setLoading] = useState(false);
  const [serviceTypeOptions, setServiceTypeOptions] = useState([]);
  const [fileName, setFileName] = useState('service_icon');
  const formApi = useRef();
  const navigate = useNavigate();

  const actionName = I18n.t(
    page_type === 'create'
      ? 'workspace_create'
      : page_type === 'edit'
        ? 'Edit'
        : 'View',
  );
  const readonly = page_type === 'view';
  console.log(page_type, mcpId);

  const handleSubmit = useCallback(
    values => {
      const subParams = {
        mcpId,
        mcpName: values.service_name,
        mcpIcon:
          values.service_cover[0].response.body.path ||
          parseUrl(values.service_cover[0].url),
        mcpDesc: values.service_desc,
        mcpType: values.service_type,
        mcpInstallMethod: values.install_type,
        mcpConfig: values.service_config,
      };
      console.log('🚀 ~ handleSubmit ~ values:', subParams, values);

      setLoading(true);
      aopApi
        .AddEditMCPResource(subParams)
        .then(() => {
          page_type === 'edit'
            ? Toast.success(I18n.t('Edit_success'))
            : Toast.success(I18n.t('Save_success'));
          navigate(-1);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [mcpId, page_type, navigate],
  );

  useEffect(() => {
    aopApi.GetMCPTypeEnum().then(res => {
      const list =
        res.body.serviceInfoList.map(item => ({
          label: item.typeName,
          value: item.typeId,
        })) || [];
      setServiceTypeOptions(list);
    });
  }, []);

  useEffect(() => {
    if (mcpId) {
      aopApi
        .GetMCPResourceDetail({
          mcpId,
        })
        .then(res => {
          const data = res.body;
          const initParams = {
            service_name: data.mcpName,
            service_cover: [
              {
                uid: '1',
                name: 'cover',
                url: replaceUrl(data.mcpIcon),
                status: 'done',
                response: {
                  header: { errorCode: '0' },
                  body: { path: data.mcpIcon },
                },
              },
            ],
            service_type: data.mcpType,
            service_desc: data.mcpDesc,
            install_type: data.mcpInstallMethod,
            service_config: data.mcpConfig,
          };
          if (formApi.current) {
            formApi.current.setValues(initParams);
            formApi.current.validate();
          }
        });
    }
  }, [mcpId]);

  return (
    <Layout>
      <Header>
        <HeaderTitle>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Button
                color="secondary"
                icon={<IconCozArrowLeft />}
                onClick={() => navigate(-1)}
              >
                {I18n.t('back')}
              </Button>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <div className={styles.mcpTitle}>
                {actionName + I18n.t('workspace_mcp_detail')}
              </div>
            </Breadcrumb.Item>
          </Breadcrumb>
        </HeaderTitle>
      </Header>
      <Content className={styles.mcpDetailContent}>
        <Spin spinning={loading}>
          <Form
            getFormApi={api => (formApi.current = api)}
            labelPosition="top"
            showValidateIcon={false}
            autoComplete="off"
            disabled={loading || readonly}
            onSubmit={handleSubmit}
          >
            <Form.Input
              field="service_name"
              label={I18n.t('coze_workspace_mcp_detail_service_name')}
              style={{ width: valueWidth }}
              trigger="blur"
              maxLength={50}
              placeholder={I18n.t(
                'coze_workspace_mcp_detail_service_name_collect',
              )}
              rules={[
                {
                  required: true,
                  message: I18n.t(
                    'coze_workspace_mcp_detail_service_name_collect',
                  ),
                },
              ]}
            />
            <Form.Upload
              field="service_cover"
              label={I18n.t('coze_workspace_mcp_detail_service_cover')}
              listType="picture"
              accept=".jpeg,.jpg,.png,.webp"
              limit={1}
              maxSize={5 * 1024}
              action={aopApi.genBaseURL('common/uploadFile')}
              data={{
                fileType: 'image',
                fileName,
              }}
              onFileChange={e => {
                setFileName(e[0].name);
              }}
              name="uploadFile"
              picWidth={80}
              picHeight={80}
              rules={[
                {
                  required: true,
                  message: I18n.t(
                    'coze_workspace_mcp_detail_service_cover_collect',
                  ),
                },
                {
                  validator: (_rule, value) => {
                    const code = value?.[0]?.response?.header?.errorCode;

                    if (code) {
                      return (
                        code === '0' ||
                        new Error(I18n.t('imageflow_upload_error'))
                      );
                    } else {
                      return (
                        value?.[0]?.url ||
                        new Error(I18n.t('plugin_file_upload_mention_image'))
                      );
                    }
                  },
                  message: '',
                },
              ]}
            >
              <IconCozPlus className="w-[24px] h-[24px] coz-fg-primary" />
            </Form.Upload>
            <Form.Select
              field="service_type"
              label={{
                text: I18n.t('coze_workspace_mcp_detail_service_type'),
              }}
              optionList={serviceTypeOptions}
              style={{ width: valueWidth }}
              placeholder={I18n.t(
                'coze_workspace_mcp_detail_service_type_collect',
              )}
              rules={[
                {
                  required: true,
                  message: I18n.t(
                    'coze_workspace_mcp_detail_service_type_collect',
                  ),
                },
              ]}
            />
            <Form.TextArea
              field="service_desc"
              label={I18n.t('coze_workspace_mcp_detail_service_desc')}
              style={{ width: valueWidth }}
              trigger="blur"
              maxLength={50}
              placeholder={I18n.t(
                'coze_workspace_mcp_detail_service_desc_collect',
              )}
              rules={[
                {
                  required: true,
                  message: I18n.t(
                    'coze_workspace_mcp_detail_service_desc_collect',
                  ),
                },
              ]}
            />
            <Form.RadioGroup
              rules={[
                {
                  required: true,
                  message: I18n.t(
                    'coze_workspace_mcp_detail_install_type_collect',
                  ),
                },
              ]}
              trigger="blur"
              field="install_type"
              type="card"
              label={{
                text: I18n.t('coze_workspace_mcp_detail_install_type'),
              }}
              options={installTypeOptions}
            />
            <Form.TextArea
              field="service_config"
              label={{
                text: I18n.t('coze_workspace_mcp_detail_service_config'),
                extra: (
                  <span
                    className={cls(styles['help-text'], 'coz-fg-secondary')}
                  >
                    {I18n.t('coze_workspace_mcp_detail_service_config_help')}
                  </span>
                ),
              }}
              style={{ width: valueWidth }}
              rows={20}
              trigger="blur"
              placeholder={I18n.t(
                'coze_workspace_mcp_detail_service_config_collect',
              )}
              rules={[
                {
                  required: true,
                  message: I18n.t(
                    'coze_workspace_mcp_detail_service_config_collect',
                  ),
                },
              ]}
            />
            {!readonly && (
              <div className="w-[540px] mt-[24px] flex justify-center gap-[12px]">
                <Button
                  size="large"
                  type="primary"
                  htmlType="submit"
                  // onClick={() => formApi.current?.submitForm()}
                >
                  {I18n.t('SaveDeploy')}
                </Button>
              </div>
            )}
          </Form>
        </Spin>
      </Content>
    </Layout>
  );
};
