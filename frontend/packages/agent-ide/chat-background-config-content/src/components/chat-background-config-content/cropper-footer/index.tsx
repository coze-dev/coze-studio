import React from 'react';

import { I18n } from '@coze-arch/i18n';
import { Button } from '@coze-arch/coze-design';

interface CropperFooterProps {
  loading: boolean;
  disabledConfig: Record<'upload' | 'submit', boolean>;
  handleOpenFileDialog: () => void;
  handleCancel: () => void;
  handleSubmit: () => void;
}

export const CropperFooter: React.FC<CropperFooterProps> = ({
  handleOpenFileDialog,
  handleCancel,
  handleSubmit,
  loading,
  disabledConfig,
}) => (
  <div className="flex justify-between p-6 coz-bg-max">
    <div>
      <Button
        onClick={handleOpenFileDialog}
        color="primary"
        disabled={disabledConfig.upload}
      >
        {I18n.t('bgi_reupload')}
      </Button>
      {!disabledConfig.submit ? (
        <span className="coz-fg-dim ml-3 text-xs">
          {I18n.t('bgi_adjust_tooltip_content')}
        </span>
      ) : null}
    </div>

    <div className="flex gap-2">
      <Button
        onClick={handleCancel}
        color="highlight"
        className="!coz-mg-hglt !coz-fg-hglt"
      >
        {I18n.t('Cancel')}
      </Button>
      <Button
        onClick={handleSubmit}
        loading={loading}
        disabled={disabledConfig.submit}
      >
        {I18n.t('Confirm')}
      </Button>
    </div>
  </div>
);
