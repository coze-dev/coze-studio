import { useTestsetManageStore } from '../use-testset-manage-store';
import { TestsetEditForm } from './edit-form';
import { ChatFlowTestsetEditForm } from './chat-flow-edit-form';

interface TestsetEditPanelProps {
  isChatFlow?: boolean;
  onParentClose?: () => void;
}

export const TestsetEditPanel: React.FC<TestsetEditPanelProps> = ({
  isChatFlow,
  onParentClose,
}) => {
  const { editPanelVisible, editData } = useTestsetManageStore(store => ({
    editPanelVisible: store.editPanelVisible,
    editData: store.editData,
  }));

  if (!editPanelVisible) {
    return null;
  }

  return isChatFlow ? (
    <ChatFlowTestsetEditForm data={editData} onParentClose={onParentClose} />
  ) : (
    <TestsetEditForm data={editData} />
  );
};
