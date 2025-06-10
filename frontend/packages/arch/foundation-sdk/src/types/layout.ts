export interface BackButtonProps {
  onClickBack: () => void;
}

/** 导航栏自定义按钮属性 */
export interface NavBtnProps {
  // 必填，Nav.Item导航组件唯一key，路由匹配时高亮
  navKey: string;
  //按钮图标
  icon?: React.ReactNode;
  // 按钮名称
  label: string | React.ReactNode;
  // 后缀节点
  suffix?: string | React.ReactNode;
  // 仅在左侧导航栏默认模式中展示
  onlyShowInDefault?: boolean;
  // 按钮点击回调
  onClick: (e: React.MouseEvent) => void;
}
