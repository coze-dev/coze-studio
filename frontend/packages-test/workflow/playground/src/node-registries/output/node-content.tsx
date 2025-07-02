import { InputParameters } from '../common/components';
import { useFlags } from '@coze-arch/bot-flags';
import { MessageContent as OutputContentOld } from '@/components/node-render/node-render-new/content/message-content';
import { OutputTextContent } from './components/output-text-content';
import { I18n } from '@coze-arch/i18n';

export function OutputContent() {
  const [FLAGS] = useFlags();
  // 社区版暂不支持该功能
  if (!FLAGS['bot.automation.output_node_v2']) {
    return <OutputContentOld />;
  }
  return (
    <>
      <InputParameters label={I18n.t('workflow_detail_node_output')} />
      <OutputTextContent />
    </>
  );
}
