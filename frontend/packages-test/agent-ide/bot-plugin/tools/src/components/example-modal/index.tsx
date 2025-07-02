import { useState, type FC } from 'react';

import { I18n } from '@coze-arch/i18n';
import { UIModal } from '@coze-arch/bot-semi';
import { type PluginAPIInfo } from '@coze-arch/bot-api/plugin_develop';

import { STATUS } from '../plugin_modal/types/modal';
import { Debug } from '../plugin_modal/debug';
import { useDebugFooter } from '../../hooks/example/use-debug-footer';

export enum ExampleScene {
  ViewExample,
  EditExample,
  ReadonlyExample,
}

interface ExampleModalProps {
  visible: boolean;
  onCancel: () => void;
  apiInfo: PluginAPIInfo;
  pluginId: string;
  pluginName: string;
  onSave?: () => void;
}

export const ExampleModal: FC<ExampleModalProps> = ({
  visible,
  onCancel,
  apiInfo,
  pluginId,
  pluginName,
  onSave,
}) => {
  const [dugStatus, setDebugStatus] = useState<STATUS | undefined>(STATUS.FAIL);
  const onNextStep = () => {
    onSave?.();
    setDebugStatus(undefined);
  };
  const cancelHandle = () => {
    onCancel();
    setDebugStatus(undefined);
  };
  const { debugFooterNode, setDebugExample, debugExample } = useDebugFooter({
    apiInfo,
    loading: false,
    dugStatus,
    btnLoading: false,
    nextStep: onNextStep,
  });
  return (
    <UIModal
      title={I18n.t('plugin_edit_tool_edit_example')}
      visible={visible}
      width={1280}
      style={{ height: 'calc(100vh - 140px)', minWidth: '1040px' }}
      centered
      onCancel={cancelHandle}
      footer={<div>{debugFooterNode}</div>}
    >
      {apiInfo ? (
        <Debug
          disabled={false}
          isViewExample={true}
          setDebugStatus={setDebugStatus}
          pluginId={pluginId}
          apiId={apiInfo?.api_id ?? ''}
          apiInfo={apiInfo as PluginAPIInfo}
          pluginName={pluginName}
          setDebugExample={setDebugExample}
          debugExample={debugExample}
        />
      ) : null}
    </UIModal>
  );
};
