import { useState, useRef } from 'react';

import { type Form } from '@coze/coze-design';
import { type DraftBot } from '@coze-arch/bot-api/developer_api';

import { type AgentInfoFormValue } from './agent-info-form';

export interface UseAgentFormManagementProps {
  initialBotInfo?: DraftBot;
}

export const useAgentFormManagement = ({
  initialBotInfo,
}: UseAgentFormManagementProps) => {
  const formRef = useRef<Form<AgentInfoFormValue>>(null);
  const [isOkButtonDisable, setOkButtonDisable] = useState(
    !initialBotInfo?.name?.trim(),
  );
  const [botInfo4Generate, setBotInfo4Generate] = useState<{
    name: string;
    desc: string;
    avatar: { uri: string; url: string };
  }>({
    name: initialBotInfo?.name || '',
    desc: initialBotInfo?.description || '',
    avatar: {
      uri: initialBotInfo?.icon_uri || '',
      url: initialBotInfo?.icon_url || '',
    },
  });
  const [checkErr, setCheckErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [confirmDisabled, setConfirmDisabled] = useState(false);

  const resetFormState = () => {
    setOkButtonDisable(!initialBotInfo?.name?.trim());
    setBotInfo4Generate({
      name: initialBotInfo?.name || '',
      desc: initialBotInfo?.description || '',
      avatar: {
        uri: initialBotInfo?.icon_uri || '',
        url: initialBotInfo?.icon_url || '',
      },
    });
    setCheckErr(false);
    setErrMsg('');
  };

  const handleFormValuesChange = (values: AgentInfoFormValue) => {
    setBotInfo4Generate({
      name: values.name?.trim() || '',
      desc: values.target?.trim() || '',
      avatar: {
        uri: values.bot_uri?.[0]?.uid || '',
        url: values.bot_uri?.[0]?.url || '',
      },
    });
    setCheckErr(false);
    setErrMsg('');
    setOkButtonDisable(!values.name?.trim());
  };

  const getValues = async () => {
    const formApi = formRef.current?.formApi;
    await formApi?.validate();
    return formApi?.getValues();
  };

  const setBotIcon = (val: { url: string; uid: string }) => {
    const formApi = formRef.current?.formApi;
    formApi?.setValue('bot_uri', [val]);
  };

  return {
    formRef,
    isOkButtonDisable,
    botInfo4Generate,
    checkErr,
    errMsg,
    confirmDisabled,
    setCheckErr,
    setErrMsg,
    setConfirmDisabled,
    setOkButtonDisable,
    handleFormValuesChange,
    getValues,
    setBotIcon,
    resetFormState,
  };
};
