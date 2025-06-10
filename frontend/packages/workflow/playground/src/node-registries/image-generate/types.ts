import { type ViewVariableType, type InputValueVO } from '@coze-workflow/base';

export interface FormData {
  inputs: {
    modelSetting: ModelSetting;
    references: Reference[];
    prompt: {
      prompt: string;
      negative_prompt: string;
    };
    inputParameters: InputValueVO[];
  };
  outputs: Output[] | (() => Output[]);
}

export interface ModelSetting {
  model: number;
  custom_ratio: {
    width: number;
    height: number;
  };
  ddim_steps: number;
}

export interface Reference {
  preprocessor?: number;
  url?: string;
  weight?: number;
}

export interface Output {
  key: string;
  name: string;
  type: ViewVariableType;
}
