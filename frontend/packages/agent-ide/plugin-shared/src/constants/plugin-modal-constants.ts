export enum MineActiveEnum {
  All = '1',
  Mine = '2',
}
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;

// 必须为字符串，不能使用数字。（plugin的类型是数字，根据是否数字区分出类型的，Plugin-filter中可查看具体原因）
export enum PluginFilterType {
  Mine = 'mine',
  Team = 'team',
  Favorite = 'favorite',
  Project = 'project',
}
