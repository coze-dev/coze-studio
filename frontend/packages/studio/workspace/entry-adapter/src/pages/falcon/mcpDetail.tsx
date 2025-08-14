/* eslint-disable @coze-arch/max-line-per-function */
/* eslint-disable prettier/prettier */
import { useEffect, useCallback, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { I18n } from '@coze-arch/i18n';
import { Button, Breadcrumb, Form, Button } from '@coze-arch/coze-design';
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
import { uploadRequest } from './utils';
import { aopApi, ProductApi } from '@coze-arch/bot-api';

import styles from './index.module.less';

export const FalconMcpDetail = ({ spaceId }) => {
  const { page_type } = useParams();
  const mcpId = getParamsFromQuery({ key: 'mcp_id' });
  const [loading, setLoading] = useState(false);
  const [serviceTypeOptions, setServiceTypeOptions] = useState([]);
  const [fileName, setFileName] = useState('service_icon');
  const formApi = useRef();
  const navigate = useNavigate();
  const goBack = () => {
    navigate(-1);
  };
  const actionName = I18n.t(
    page_type === 'create'
      ? 'workspace_create'
      : page_type === 'edit'
        ? 'Edit'
        : 'View',
  );
  const installTypeOptions = [
    {
      label: 'npx',
      value: 'npx',
    },
    {
      label: 'uvx',
      value: 'uvx',
    },
    {
      label: 'sse',
      value: 'sse',
    },
  ];
  console.log(page_type, mcpId);

  const handleSubmit = () => {
    formApi.current.validate().then(values => {
      console.log('🚀 ~ handleSubmit ~ values:', values);
    });
  };

  useEffect(() => {
    aopApi.GetMCPTypeEnum().then(res => {
      const list =
        res.body.serviceInfoList.map(item => ({
          label: item.typeName,
          value: item.typeId,
        })) || [];
      console.log('🚀 ~ FalconMcpDetail ~ list:', list);
      setServiceTypeOptions(list);
    });
  }, []);
  return (
    <Layout>
      <Header>
        <HeaderTitle>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Button
                color="secondary"
                icon={<IconCozArrowLeft />}
                onClick={goBack}
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
        <HeaderActions></HeaderActions>
      </Header>
      <Content>
        <div className={styles.mcpDetailContent}>
          <Form
            getFormApi={api => (formApi.current = api)}
            labelPosition="top"
            showValidateIcon={false}
            className={styles['form-wrap']}
            // onValueChange={values =>
            //   // onFormValueChange(
            //   //   values,
            //   // )
            // }
            autoComplete="off"
            disabled={loading}
          >
            <Form.Input
              field="service_name"
              label={I18n.t('coze_workspace_mcp_detail_service_name')}
              style={{ width: '540px' }}
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
              // customRequest={uploadRequest(ProductApi.PublicUploadImage)}
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
                  validator: (_rule, value) =>
                    value[0]?.response?.header?.errorCode === '0',
                  message:
                    I18n.t('card_builder_image') + I18n.t('Upload_failed'),
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
              // initValue={defaultServiceTypeOptionsValue}
              style={{ width: '540px' }}
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
              style={{ width: '540px' }}
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
              style={{ width: '540px' }}
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
              style={{ width: '540px', height: '320px' }}
              trigger="blur"
              // maxLength={50}
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
            <div className="w-[540px] mt-[24px] flex justify-center gap-[12px]">
              <Button size="large" type="primary" onClick={handleSubmit}>
                {I18n.t('SaveDeploy')}
              </Button>
            </div>
          </Form>
        </div>
      </Content>
    </Layout>
  );
};
