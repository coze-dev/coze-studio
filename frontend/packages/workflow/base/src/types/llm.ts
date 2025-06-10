// 跟后端约定好的协议，workflow 后端不感知。对应 api/bot/get_type_list 接口中 response.data.modal_list[*].model_params[*].default 的 key
export enum GenerationDiversity {
  Customize = 'default_val',
  Creative = 'creative',
  Balance = 'balance',
  Precise = 'precise',
}

export const RESPONSE_FORMAT_NAME = 'response_format';
