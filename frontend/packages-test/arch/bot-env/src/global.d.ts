// copy from @byted/uploader
type TUploaderRegion =
  | 'cn-north-1'
  | 'us-east-1'
  | 'ap-singapore-1'
  | 'us-east-red'
  | 'boe'
  | 'boei18n'
  | 'US-TTP'
  | 'gcp';

interface Window {
  gfdatav1?: {
    // 部署区域
    region?: string;
    // SCM 版本
    ver?: number | string;
    // 当前环境, 取值为 boe 或 prod
    env?: 'boe' | 'prod';
    // 环境标识，如 prod 或 ppe_*
    envName?: string;
    // 当前的小流量频道 ID，0 表示全流量
    canary?: 0;
    extra?: {
      /**
       * @description goofy 团队不建议依赖该字段，能不用则不用
       * 1 表示小流量
       * 3 表示灰度
       * null 表示全流量
       */
      canaryType?: 1 | 3 | null;
    };
  };
}
