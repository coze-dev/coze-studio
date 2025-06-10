import { I18n } from '@coze-arch/i18n';
import { Modal, Form, Input, type ModalProps } from '@coze/coze-design';

export interface DeleteProjectBaseProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export interface DeleteProjectModalProps
  extends Omit<
      ModalProps,
      'size' | 'footer' | 'header' | 'okButtonColor' | 'okText' | 'cancelText'
    >,
    DeleteProjectBaseProps {}

const DeleteProjectContent: React.FC<DeleteProjectBaseProps> = ({
  value,
  onChange,
  placeholder,
}) => (
  <>
    <div className="coz-fg-secondary leading-20px text-[14px] font-normal mb-16px">
      {I18n.t('project_ide_delete_confirm_describe')}
    </div>
    <Form.Label required>{I18n.t('project_ide_project_name')}</Form.Label>
    <Input value={value} onChange={onChange} placeholder={placeholder} />
  </>
);

export const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({
  value,
  onChange,
  placeholder,
  ...restModalProps
}) => (
  <Modal
    size="default"
    header={I18n.t('project_ide_delete_confirm')}
    okButtonColor="red"
    okText={I18n.t('project_ide_delete')}
    cancelText={I18n.t('Cancel')}
    {...restModalProps}
  >
    <DeleteProjectContent
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  </Modal>
);
