/* eslint-disable @coze-arch/max-line-per-function */
import { type FC, useMemo, useState, useEffect } from 'react';

import { withSlardarIdButton } from '@coze-studio/bot-utils';
import { I18n } from '@coze-arch/i18n';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import {
  ParameterLocation,
  type CreationMethod,
  type PluginType,
} from '@coze-arch/bot-api/plugin_develop';
import { PluginDevelopApi } from '@coze-arch/bot-api';
import { type PluginInfoProps } from '@coze-studio/plugin-shared';
import {
  PluginForm,
  usePluginFormState,
} from '@coze-studio/plugin-form-adapter';
import { ERROR_CODE } from '@coze-agent-ide/bot-plugin-tools/pluginModal/types';
import { IconCozInfoCircleFill } from '@coze/coze-design/icons';
import {
  Button,
  Divider,
  Modal,
  Space,
  Toast,
  Typography,
} from '@coze/coze-design';

import s from '../index.module.less';
import { PluginDocs } from '../../plugin-docs';
import { ImportModal } from './import-modal';
import { CodeModal } from './code-modal';

export interface CreatePluginFormProps {
  visible: boolean;
  isCreate?: boolean;
  editInfo?: PluginInfoProps;
  disabled?: boolean;
  onCancel?: () => void;
  onSuccess?: (pluginID?: string) => Promise<void> | void;
  projectId?: string;
}

export const CreateFormPluginModal: FC<CreatePluginFormProps> = props => {
  const {
    onCancel,
    editInfo,
    isCreate = true,
    visible,
    onSuccess,
    disabled = false,
    projectId,
  } = props;

  const { id } = useSpaceStore(store => store.space);
  const modalTitle = useMemo(() => {
    if (isCreate) {
      return (
        <div className="w-full flex justify-between items-center pr-[8px]">
          <div>{I18n.t('create_plugin_modal_title1')}</div>
          <Space>
            <CodeModal
              onCancel={onCancel}
              onSuccess={onSuccess}
              projectId={projectId}
            />
            <ImportModal
              onCancel={onCancel}
              onSuccess={onSuccess}
              projectId={projectId}
            />
            <Divider layout="vertical" className="h-5" />
          </Space>
        </div>
      );
    }
    if (disabled) {
      return I18n.t('plugin_detail_view_modal_title');
    }
    return I18n.t('plugin_detail_edit_modal_title');
  }, [isCreate, disabled]);
  const [loading, setLoading] = useState(false);
  const pluginState = usePluginFormState();

  const {
    formApi,
    extItems,
    headerList,
    isValidCheckResult,
    setIsValidCheckResult,
    pluginTypeCreationMethod,
    defaultRuntime,
  } = pluginState;

  useEffect(() => {
    if (!isCreate) {
      return;
    }
    if (visible) {
      // 显示后滚动条滑动到最上边
      const modalContent = document.querySelector(
        '.create-plugin-modal-content .semi-modal-body',
      );
      if (modalContent) {
        modalContent.scrollTop = 0;
      }
    } else {
      // 隐藏后重置表单
      formApi?.current?.reset();
    }
  }, [visible]);

  // eslint-disable-next-line complexity
  const confirmBtn = async () => {
    await formApi.current?.validate();
    const type = isCreate ? 'create' : 'edit';
    const val = formApi.current?.getValues();
    if (!val || !pluginTypeCreationMethod) {
      return;
    }

    const json: Record<string, string> = {};
    extItems?.forEach(item => {
      if (item.key in val) {
        json[item.key] = val[item.key];
      }
    });

    const [pluginType, creationMethod] = pluginTypeCreationMethod.split('-');

    const mainAuthType = val.auth_type?.at(0);
    const serviceSubAuthType = val.auth_type?.at(-1);
    const initParams = {
      ...val,
      icon: { uri: val?.plugin_uri?.[0]?.uid },
      // 如果是 service 鉴权，使用subType去传递下一层authType
      auth_type: mainAuthType === 1 ? 1 : val.auth_type?.at(-1) || 0,
      common_params: {
        [ParameterLocation.Header]: headerList,
        [ParameterLocation.Body]: [],
        [ParameterLocation.Path]: [],
        [ParameterLocation.Query]: [],
      },
      space_id: String(id),
      project_id: projectId,
      creation_method: Number(creationMethod) as unknown as CreationMethod,
      ide_code_runtime: val.ide_code_runtime ?? defaultRuntime,
      plugin_type: Number(pluginType) as unknown as PluginType,
      private_link_id:
        val.private_link_id === '0' ? undefined : val.private_link_id,
    };
    const params =
      mainAuthType === 1
        ? {
            ...initParams,
            sub_auth_type: serviceSubAuthType,
            auth_payload: JSON.stringify(json),
          }
        : {
            ...initParams,
            oauth_info: JSON.stringify(json),
          };
    const action = {
      create: async () => {
        const res = await PluginDevelopApi.RegisterPluginMeta(
          {
            ...params,
          },
          {
            __disableErrorToast: true,
          },
        );
        return res.plugin_id;
      },
      edit: async () => {
        await PluginDevelopApi.UpdatePluginMeta(
          {
            ...params,
            plugin_id: editInfo?.plugin_id || '',
            edit_version: editInfo?.edit_version,
          },
          {
            __disableErrorToast: true,
          },
        );
        return '';
      },
    };

    try {
      setLoading(true);
      const pluginID = await action[type]();
      Toast.success({
        content: isCreate
          ? I18n.t('Plugin_new_toast_success')
          : I18n.t('Plugin_update_toast_success'),
        showClose: false,
      });
      onCancel?.();
      onSuccess?.(pluginID);
    } catch (error) {
      // @ts-expect-error -- linter-disable-autofix
      const { code, msg } = error;
      if (Number(code) === ERROR_CODE.SAFE_CHECK) {
        setIsValidCheckResult(false);
      } else {
        Toast.error({
          content: withSlardarIdButton(msg),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        title={modalTitle}
        className="[&_.semi-modal-header]:items-center"
        visible={visible}
        keepDOM={isCreate}
        onCancel={() => onCancel?.()}
        modalContentClass="create-plugin-modal-content"
        footer={
          !disabled && (
            <div>
              {!isValidCheckResult && (
                <div className={s['error-msg-box']}>
                  <span className={s['error-msg']}>
                    {I18n.t('plugin_create_modal_safe_error')}
                  </span>
                </div>
              )}
              <Typography.Paragraph
                type="secondary"
                fontSize="12px"
                className="text-start mb-[16px]"
              >
                <IconCozInfoCircleFill className="coz-fg-hglt text-[14px] align-sub" />
                <span className="mx-[4px]">
                  {I18n.t('plugin_create_draft_desc')}
                </span>
                <PluginDocs />
              </Typography.Paragraph>
              <div>
                <Button
                  color="primary"
                  onClick={() => {
                    onCancel?.();
                  }}
                >
                  {I18n.t('create_plugin_modal_button_cancel')}
                </Button>
                <Button
                  loading={loading}
                  onClick={() => {
                    confirmBtn();
                  }}
                >
                  {I18n.t('create_plugin_modal_button_confirm')}
                </Button>
              </div>
            </div>
          )
        }
      >
        <PluginForm
          pluginState={pluginState}
          visible={visible}
          isCreate={isCreate}
          disabled={disabled}
          editInfo={editInfo}
        />
      </Modal>
    </>
  );
};
