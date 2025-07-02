import React, { type CSSProperties } from 'react';

import { type Model } from '@coze-arch/bot-api/developer_api';

import { ModelSelectV2 } from './model-select-v2';

export interface ModelSelectProps {
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
}) => (
  <ModelSelectV2
    className={className}
    value={value}
    onChange={onChange}
    models={models}
    readonly={readonly}
  />
);
