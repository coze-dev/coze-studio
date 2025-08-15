/* eslint-disable @coze-arch/max-line-per-function */
/* eslint-disable prettier/prettier */
import { useEffect, useCallback, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { I18n } from '@coze-arch/i18n';
import { Button, Breadcrumb, Form, Spin, Toast } from '@coze-arch/coze-design';
import { useParams } from 'react-router-dom';
import { IconCozPlus } from '@coze-arch/coze-design/icons';

import cls from 'classnames';
import { replaceUrl, parseUrl, installTypeOptions } from './utils';
import { aopApi } from '@coze-arch/bot-api';

export const FalconCardDetail = ({
  spaceId,
  type,
  info,
  onClose,
  onSuccess,
}) => {
  const valueWidth = '100%';
  const [loading, setLoading] = useState(false);
  const [cardTypeOptions, setCardTypeOptions] = useState([]);
  const [fileName, setFileName] = useState('card_icon');
  const formApi = useRef();

  const readonly = type === 'view';
  const isEdit = type === 'edit';

  const handleSubmit = useCallback(
    values => {
      const subParams = {
        cardId: info?.cardId,
        code: values.card_code,
        cardName: values.card_name,
        picUrl:
          values.card_cover[0].response.body.path ||
          parseUrl(values.card_cover[0].url),
        cardClassId: values.card_type,
        sassWorkspaceId: spaceId,
      };

      console.log('🚀 ~ handleSubmit ~ values:', subParams);

      setLoading(true);
      if (isEdit) {
        aopApi
          .EditCardResource(subParams)
          .then(() => {
            Toast.success(I18n.t('Edit_success'));
            onSuccess?.();
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        aopApi
          .AddCardResource(subParams)
          .then(() => {
            Toast.success(I18n.t('Save_success'));
            onSuccess?.();
          })
          .finally(() => {
            setLoading(false);
          });
      }
    },
    [info?.cardId, isEdit, onSuccess, spaceId],
  );

  useEffect(() => {
    aopApi
      .GetCardTypes({
        sassWorkspaceId: spaceId,
      })
      .then(res => {
        const list =
          res.body.cardClassList.map(item => ({
            label: item.name,
            value: item.id,
          })) || [];
        setCardTypeOptions(list);
      });
  }, [spaceId]);

  useEffect(() => {
    if (info?.cardId) {
      const initParams = {
        card_code: info.code,
        card_name: info.cardName,
        card_cover: [
          {
            uid: '1',
            name: 'cover',
            url: replaceUrl(info.picUrl),
            status: 'done',
            response: {
              header: { errorCode: '0' },
              body: { path: info.picUrl },
            },
          },
        ],
        card_type: info.cardClassId,
      };
      if (formApi.current) {
        formApi.current.setValues(initParams);
        formApi.current.validate();
      }
    }
  }, [info]);

  return (
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
          field="card_code"
          label={I18n.t('coze_workspace_card_detail_card_code')}
          style={{ width: valueWidth }}
          trigger="blur"
          maxLength={50}
          disabled={loading || readonly || isEdit}
          placeholder={I18n.t('coze_workspace_card_detail_card_code_collect')}
          rules={[
            {
              required: true,
              message: I18n.t('coze_workspace_card_detail_card_code_collect'),
            },
          ]}
        />
        <Form.Input
          field="card_name"
          label={I18n.t('coze_workspace_card_detail_card_name')}
          style={{ width: valueWidth }}
          trigger="blur"
          maxLength={50}
          placeholder={I18n.t('coze_workspace_card_detail_card_name_collect')}
          rules={[
            {
              required: true,
              message: I18n.t('coze_workspace_card_detail_card_name_collect'),
            },
          ]}
        />
        <Form.Select
          field="card_type"
          label={{
            text: I18n.t('coze_workspace_card_detail_card_type'),
          }}
          optionList={cardTypeOptions}
          style={{ width: valueWidth }}
          placeholder={I18n.t('coze_workspace_card_detail_card_type_collect')}
          rules={[
            {
              required: true,
              message: I18n.t('coze_workspace_card_detail_card_type_collect'),
            },
          ]}
        />
        <Form.Upload
          field="card_cover"
          label={I18n.t('coze_workspace_card_detail_card_cover')}
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
                    code === '0' || new Error(I18n.t('imageflow_upload_error'))
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
        {!readonly && (
          <div className="w-[540px] py-[24px] flex justify-center gap-[12px]">
            <Button size="large" type="primary" htmlType="submit">
              {I18n.t('SaveDeploy')}
            </Button>
          </div>
        )}
      </Form>
    </Spin>
  );
};
