import { I18n } from '@coze-arch/i18n';
import { IconCozAdjust } from '@coze-arch/coze-design/icons';
import { Typography } from '@coze-arch/coze-design';

import { useChatFlowTestFormStore } from './test-form-provider';

import css from './test-form-float-button.module.less';

export const TestFormFloatButton = ({
  isChatError,
}: {
  isChatError?: boolean;
}) => {
  const { hasForm, patch } = useChatFlowTestFormStore(store => ({
    hasForm: store.hasForm,
    patch: store.patch,
  }));

  const handleOpenForm = () => {
    patch({ visible: true });
  };

  if (!hasForm) {
    return null;
  }

  return (
    <>
      <div
        className={css['float-button']}
        onClick={handleOpenForm}
        style={
          isChatError === true
            ? { position: 'absolute', left: 69, bottom: 123 }
            : {}
        }
      >
        <Typography.Text className="coz-fg-primary">
          {I18n.t('wf_chatflow_71')}
        </Typography.Text>
        <IconCozAdjust className="coz-fg-dim" />
      </div>
    </>
  );
};
