import { useCallback } from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozStopCircle } from '@coze-arch/coze-design/icons';
import { Tooltip, AIButton } from '@coze-arch/coze-design';

import { useAutoGen } from './use-auto-gen';

import styles from './auto-gen-button.module.less';

interface AutoGenButtonProps {
  onGenerate: (data: any) => void;
}

export const AutoGenButton: React.FC<AutoGenButtonProps> = ({ onGenerate }) => {
  const { generate, abort, generating } = useAutoGen();

  const handleGenerate = useCallback(async () => {
    const data = await generate();
    if (data?.length) {
      onGenerate(data);
    }
  }, [onGenerate, generate]);

  return (
    <div className={styles['auto-gen']}>
      {generating ? (
        <Tooltip content={I18n.t('workflow_testset_stopgen')}>
          <AIButton
            icon={<IconCozStopCircle />}
            onlyIcon={true}
            onClick={abort}
            color="aiplus"
            size="small"
          />
        </Tooltip>
      ) : null}
      <AIButton
        loading={generating}
        onClick={handleGenerate}
        color="aiplus"
        size="small"
      >
        {generating
          ? I18n.t('workflow_testset_generating')
          : I18n.t('workflow_testset_aigenerate')}
      </AIButton>
    </div>
  );
};
