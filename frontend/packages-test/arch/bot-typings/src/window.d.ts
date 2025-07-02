declare type MicroComponentsMapItem = {
  version: string;
  cdnUrl: string;
};

interface Window {
  /**
   * IDE plugin iframe 中挂载的用于卸载的方法
   */
  editorDispose?: any;
  MonacoEnvironment?: any;
  tt?: {
    miniProgram: {
      postMessage: (param: {
        data?: any;
        success?: (res) => void;
        fail?: (err) => void;
      }) => void;
      redirectTo: (param: {
        url?: string;
        success?: (res) => void;
        fail?: (err) => void;
      }) => void;
      navigateTo: (param: {
        url?: string;
        success?: (res) => void;
        fail?: (err) => void;
      }) => void;
      reLaunch: (param: {
        url?: string;
        success?: (res) => void;
        fail?: (err) => void;
      }) => void;
      navigateBack: (param?: {
        delta?: number;
        success?: (res) => void;
        fail?: (err) => void;
      }) => void;
      getEnv: (res) => void;
    };
  };
  __cozeapp__?: {
    props: Record<string, unknown>;
    setLoading?: (loading: boolean) => void;
  };
}

declare namespace process {
  const env: {
    [key: string]: string;
  };
}
