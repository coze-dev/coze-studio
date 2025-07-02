import React, { type CSSProperties } from 'react';

import { type Model } from '@coze-arch/bot-api/developer_api';

import {
  ModelSelectV2,
  type ModelSelectV2Props,
} from '@/form-extensions/setters/model-select/components/selector/model-select-v2';

export interface ModelSelectProps
  extends Pick<ModelSelectV2Props, 'popoverPosition' | 'triggerRender'> {
  className?: string;
  style?: CSSProperties;
  value: number | undefined;
  onChange: (value: number) => void;
  models: Model[];
  readonly?: boolean;
}

export const ModelSelector: React.FC<ModelSelectProps> = ({
  className,
  value,
  onChange,
  models,
  readonly,
  triggerRender,
  popoverPosition,
}) => (
  <ModelSelectV2
    className={className}
    value={value}
    onChange={onChange}
    models={models}
    readonly={readonly}
    popoverPosition={popoverPosition}
    triggerRender={triggerRender}
  />
);
