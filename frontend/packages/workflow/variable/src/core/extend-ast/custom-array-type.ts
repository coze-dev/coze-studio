import {
  ArrayType,
  type BaseVariableField,
} from '@flowgram-adapter/free-layout-editor';

export class CustomArrayType extends ArrayType {
  getByKeyPath(keyPath: string[]): BaseVariableField<unknown> | undefined {
    // const [curr, ...rest] = keyPath || [];

    // if (curr === '0' && this.canDrilldownItems) {
    //   // 数组第 0 项
    //   return this.items.getByKeyPath(rest);
    // }

    if (this.canDrilldownItems) {
      // Coze 中兜底为第 0 项
      return this.items.getByKeyPath(keyPath);
    }

    return;
  }
}
