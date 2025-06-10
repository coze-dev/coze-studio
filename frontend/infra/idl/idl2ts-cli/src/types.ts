import { type IPlugin } from '@coze-arch/idl2ts-generator';

export interface ApiConfig {
  // idl 入口
  entries: Record<string, string>;
  // idl 根目录
  idlRoot: string;
  // 服务别名
  // 自定义 api 方法
  commonCodePath: string;
  // api 产物目录
  output: string;
  // 仓库信息设置
  repository?: {
    // 仓库地址
    url: string;
    // clone 到本地的位置
    dest: string;
  };
  // 插件
  plugins?: IPlugin[];
  // 聚合导出的文件名
  aggregationExport?: string;
  // 格式化文件
  formatter: (name: string, content: string) => string;
  idlFetchConfig?: {
    source: string;
    branch?: string;
    commit?: string;
    rootDir?: string;
  };
}

export interface ApiTypeConfig extends ApiConfig {
  // 需要过滤的方法
  filters: Record<string, string[]>;
}
