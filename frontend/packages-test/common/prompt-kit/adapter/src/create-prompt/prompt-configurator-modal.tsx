import { useCursorInInputSlot } from '@coze-common/editor-plugins/input-slot';
import {
  PromptConfiguratorModal as BasePromptConfiguratorModal,
  type PromptConfiguratorModalProps,
  ImportPromptWhenEmptyPlaceholder,
  useCreatePromptContext,
  InsertInputSlotButton,
} from '@coze-common/prompt-kit-base/create-prompt';

export { usePromptConfiguratorModal } from '@coze-common/prompt-kit-base/create-prompt';

export const PromptConfiguratorModal = (
  props: PromptConfiguratorModalProps,
) => {
  const { isReadOnly } = useCreatePromptContext() || {};
  const inInputSlot = useCursorInInputSlot();
  return (
    <BasePromptConfiguratorModal
      {...props}
      promptSectionConfig={{
        editorPlaceholder: <ImportPromptWhenEmptyPlaceholder />,
        editorActions: <InsertInputSlotButton disabled={inInputSlot} />,
        headerActions: !isReadOnly ? (
          <div className="flex gap-2">
            <div>
              <InsertInputSlotButton disabled={inInputSlot} />
            </div>
          </div>
        ) : null,
      }}
    />
  );
};
