//后端无定义 根据bot_info中的workflow_info.profile_memory推导而来
export interface Variable {
  key: string;
  description?: string;
  default_value?: string;
}

export interface IBotSelectOption {
  name: string;
  avatar: string;
  value: string;
}
