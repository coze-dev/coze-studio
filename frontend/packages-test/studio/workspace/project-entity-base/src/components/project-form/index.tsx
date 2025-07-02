import { type PropsWithChildren } from 'react';

import {
  type DraftProjectCopyRequest,
  type DraftProjectUpdateRequest,
  type DraftProjectCreateRequest,
} from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { FileBizType, IconType } from '@coze-arch/bot-api/developer_api';
import {
  PictureUpload,
  type RenderAutoGenerateParams,
} from '@coze-common/biz-components/picture-upload';
import { botInputLengthService } from '@coze-agent-ide/bot-input-length-limit';
import { IconCozUpload } from '@coze-arch/coze-design/icons';
import {
  type BaseFormProps,
  Form,
  FormInput,
  FormTextArea,
  useFormApi,
  withField,
} from '@coze-arch/coze-design';

import { SwitchWithDesc } from '../switch-with-desc';
import { type ModifyUploadValueType } from '../../type';

export type ProjectFormValues = ModifyUploadValueType<
  Omit<DraftProjectCreateRequest, 'monetization_conf' | 'create_from'> &
    DraftProjectCopyRequest &
    DraftProjectUpdateRequest & {
      enableMonetize?: boolean;
    }
>;

export type ProjectFormSubmitValues = DraftProjectCreateRequest;

export type ProjectFormProps = BaseFormProps<ProjectFormValues>;

export interface ProjectInfoFieldProps {
  /** @default false */
  showMonetizeConfig?: boolean;
  onBeforeUpload?: () => void;
  onAfterUpload?: () => void;
  renderAutoGenerate?: (params: RenderAutoGenerateParams) => React.ReactNode;
}

export const ProjectForm: React.FC<PropsWithChildren<ProjectFormProps>> = ({
  children,
  ...formProps
}) => <Form<ProjectFormValues> {...formProps}>{children}</Form>;

export const filedKeyMap: Record<
  keyof ProjectFormValues,
  keyof ProjectFormValues
> = {
  name: 'name',
  enableMonetize: 'enableMonetize',
  description: 'description',
  icon_uri: 'icon_uri',
  space_id: 'space_id',
  project_id: 'project_id',
  to_space_id: 'to_space_id',
} as const;

export const ProjectInfoFieldFragment: React.FC<ProjectInfoFieldProps> = ({
  showMonetizeConfig,
  onAfterUpload,
  onBeforeUpload,
  renderAutoGenerate,
}) => {
  const formApi = useFormApi<ProjectFormValues>();
  return (
    <>
      <FormInput
        label={I18n.t('creat_project_project_name')}
        rules={[{ required: true }]}
        field={filedKeyMap.name}
        maxLength={botInputLengthService.getInputLengthLimit('projectName')}
        getValueLength={botInputLengthService.getValueLength}
        noErrorMessage
      />
      {showMonetizeConfig ? (
        <FormSwitch
          field={filedKeyMap.enableMonetize}
          label={I18n.t('monetization')}
          desc={I18n.t('monetization_des')}
          initValue={true}
          rules={[{ required: true }]}
        />
      ) : null}
      <FormTextArea
        label={I18n.t('creat_project_project_describe')}
        field={filedKeyMap.description}
        maxCount={botInputLengthService.getInputLengthLimit(
          'projectDescription',
        )}
        maxLength={botInputLengthService.getInputLengthLimit(
          'projectDescription',
        )}
        getValueLength={botInputLengthService.getValueLength}
      />
      <PictureUpload
        accept=".jpeg,.jpg,.png,.gif"
        label={I18n.t('bot_edit_profile_pircture')}
        field={filedKeyMap.icon_uri}
        rules={[{ required: true }]}
        fileBizType={FileBizType.BIZ_BOT_ICON}
        iconType={IconType.Bot}
        maskIcon={<IconCozUpload />}
        withAutoGenerate
        renderAutoGenerate={renderAutoGenerate}
        generateInfo={() => {
          const values = formApi.getValues();
          return {
            name: values?.name,
            desc: values?.description,
          };
        }}
        beforeUploadCustom={onBeforeUpload}
        afterUploadCustom={onAfterUpload}
      />
    </>
  );
};

const FormSwitch = withField(SwitchWithDesc);
