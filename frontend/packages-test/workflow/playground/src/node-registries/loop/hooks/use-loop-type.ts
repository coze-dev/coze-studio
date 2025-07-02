import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';
import {
  FlowNodeFormData,
  type FormModelV2,
} from '@flowgram-adapter/free-layout-editor';
import { useEffect, useLayoutEffect, useState } from 'react';
import { LoopPath, LoopType } from '../constants';

export const useLoopType = () => {
  const [loopType, setLoopType] = useState<LoopType | undefined>();

  const node = useCurrentEntity();
  const formModel = node.getData(FlowNodeFormData).getFormModel<FormModelV2>();
  const getLoopType = () =>
    formModel.getValueIn<LoopType>(LoopPath.LoopType) ?? LoopType.Array;

  // 同步表单值初始化
  useLayoutEffect(() => {
    setLoopType(getLoopType());
  }, [formModel]);

  // 同步表单外部值变化：undo/redo/协同
  useEffect(() => {
    const disposer = formModel.onFormValuesChange(({ name }) => {
      if (name !== LoopPath.LoopType) {
        return;
      }
      setLoopType(getLoopType());
    });
    return () => disposer.dispose();
  }, [formModel]);

  return loopType;
};
