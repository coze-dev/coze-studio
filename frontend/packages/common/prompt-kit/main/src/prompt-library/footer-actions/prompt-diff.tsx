import { I18n } from '@coze-arch/i18n';
import { Button } from '@coze/coze-design';
export const PromptDiff = (props: { onDiff: () => void }) => {
  const { onDiff } = props;
  return (
    <Button
      color="primary"
      onClick={() => {
        onDiff?.();
      }}
    >
      {I18n.t('compare_prompt_compare_debug')}
    </Button>
  );
};
