import { I18n } from '@coze-arch/i18n';
import { Image } from '@coze-arch/bot-semi';
import { Collapsible } from '@coze-studio/components/collapsible-icon-button';
import { ModelOptionThumb } from '@coze-agent-ide/model-manager/model-select-v2';
import {
  SingleAgentModelView as SingleAgentModelViewBase,
  type SingleAgentModelViewProps,
} from '@coze-agent-ide/bot-config-area';
import { IconCozArrowDown } from '@coze/coze-design/icons';
import { Button, Tag } from '@coze/coze-design';

const itemKey = Symbol.for('SingleAgentModelView');

export function SingleAgentModelView(props: SingleAgentModelViewProps) {
  return (
    <SingleAgentModelViewBase
      {...props}
      triggerRender={m => (
        // 模型临期时强制完整展示临期提示
        <Collapsible
          itemKey={itemKey}
          fullContent={
            <Button
              color="secondary"
              size="default"
              data-testid="bot.ide.bot_creator.set_model_view_button"
            >
              {m ? <ModelOptionThumb model={m} /> : null}
              <IconCozArrowDown className="coz-fg-secondary" />
            </Button>
          }
          collapsedContent={
            <Button
              size="default"
              color="secondary"
              icon={
                <Image
                  preview={false}
                  className="leading-none"
                  width={16}
                  height={16}
                  src={m?.model_icon}
                />
              }
            >
              {m?.model_status_details?.is_upcoming_deprecated ? (
                <span className="h-full flex items-center">
                  <Tag size="mini" color="yellow" className="font-medium">
                    {I18n.t('model_list_willDeprecated')}
                  </Tag>
                </span>
              ) : null}
            </Button>
          }
          collapsedTooltip={m?.name}
        />
      )}
    />
  );
}
