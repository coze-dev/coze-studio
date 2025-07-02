import {
  type FeishuBaseConfig,
  type InputComponent,
  type InputConfig,
  type OutputSubComponent,
  type OutputSubComponentItem,
} from '@coze-arch/bot-api/connector_api';

export type OutputSubComponentItemFe = Omit<
  OutputSubComponentItem,
  'output_type'
> & {
  output_type: number | undefined;
};

export type BaseOutputStructLineType = OutputSubComponentItemFe & {
  // eslint-disable-next-line @typescript-eslint/naming-convention -- frontend private usage
  _id: string;
};

export type OutputSubComponentFe = Omit<OutputSubComponent, 'item_list'> & {
  item_list?: BaseOutputStructLineType[];
};

export type FeishuBaseConfigFe = Omit<
  FeishuBaseConfig,
  'output_sub_component' | 'input_config'
> & {
  output_sub_component: OutputSubComponentFe;
  input_config: InputConfigFe[];
};

export interface InputComponentSelectOption {
  name: string;
  id: string;
}

export type InputComponentFe = Omit<InputComponent, 'choice'> & {
  choice: InputComponentSelectOption[];
};

export type InputConfigFe = Omit<InputConfig, 'input_component'> & {
  // eslint-disable-next-line @typescript-eslint/naming-convention -- .
  _id: string;
  input_component: InputComponentFe;
};

export type SaveConfigPayload = Pick<
  FeishuBaseConfig,
  'output_type' | 'output_sub_component' | 'input_config'
>;
