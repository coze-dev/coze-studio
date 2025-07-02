/* eslint-disable @typescript-eslint/no-explicit-any */
export const loader = {
  async init(): Promise<any> {
    const load = await this.config();
    return load.init();
  },

  async config(config = {}): Promise<any> {
    const monaco = await import('monaco-editor');
    const { loader: load } = await import('@monaco-editor/react');
    load.config({
      monaco,
      ...config,
    });
    return load;
  },
};
