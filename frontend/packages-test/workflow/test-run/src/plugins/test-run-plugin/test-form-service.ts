import { injectable } from 'inversify';
import { useService } from '@flowgram-adapter/free-layout-editor';

export type FormDataType = any;

export const TestFormService = Symbol('TestFormService');

export interface TestFormService {
  /** 表单缓存值 */
  cacheValues: Map<string, FormDataType>;

  getCacheValues: (id: string) => null | FormDataType;
  setCacheValues: (id: string, value: FormDataType) => void;
}

@injectable()
export class TestFormServiceImpl implements TestFormService {
  cacheValues = new Map();
  getCacheValues(id: string) {
    return this.cacheValues.get(id) || null;
  }
  setCacheValues(id: string, value: FormDataType) {
    this.cacheValues.set(id, value);
  }
}

export const useTestFormService = () =>
  useService<TestFormService>(TestFormService);
