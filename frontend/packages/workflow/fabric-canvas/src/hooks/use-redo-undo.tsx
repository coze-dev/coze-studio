/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
import { useCallback, useState } from 'react';

import { cloneDeep, isUndefined } from 'lodash-es';
import { useDebounceFn, useLatest } from 'ahooks';

import { type FabricSchema } from '../typings';
import { useStorageState } from './use-storage';

export const useRedoUndo = ({
  schema,
  loadFromJSON,
  stopListen,
  startListen,
  onChange,
  id,
}: {
  schema: FabricSchema;
  loadFromJSON?: (schema: FabricSchema) => void;
  stopListen: () => void;
  startListen: () => void;
  onChange?: (schema: FabricSchema) => void;
  id?: string;
}) => {
  const [history, setHistory] = useStorageState<FabricSchema[]>(
    `${id}-history`,
    {
      defaultValue: [cloneDeep(schema)],
    },
  );
  const historyLatest = useLatest(history);
  const [step, setStep] = useStorageState<number>(`${id}-step`, {
    defaultValue: 0,
  });
  const stepLatest = useLatest(step);

  const [redoUndoing, setRedoUndoing] = useState(false);

  const push = useCallback((_schema: FabricSchema) => {
    if (
      isUndefined(historyLatest.current) ||
      isUndefined(stepLatest.current) ||
      JSON.stringify(_schema) ===
        JSON.stringify(historyLatest.current[stepLatest.current])
    ) {
      return;
    }
    // 保存多少步
    const max = 20;
    const end = stepLatest.current + 1;
    const start = Math.max(0, end - max);
    const newHistory = [...historyLatest.current.splice(start, end), _schema];
    setHistory(newHistory);
    setStep(newHistory.length - 1);
  }, []);

  const undo = useCallback(async () => {
    if (
      isUndefined(historyLatest.current) ||
      isUndefined(stepLatest.current) ||
      stepLatest.current === 0
    ) {
      return;
    }

    const newStep = stepLatest.current - 1;
    const _schema = historyLatest.current[newStep];

    // 开始执行 undo
    setRedoUndoing(true);

    // 停止监听画布变化
    stopListen();

    // 保存 schema
    onChange?.(_schema);

    // 画布重新加载
    await loadFromJSON?.(_schema);

    // 同步 step
    setStep(newStep);

    // 恢复画布监听
    startListen();

    // undo 执行完成
    setRedoUndoing(false);
  }, [loadFromJSON]);

  const redo = useCallback(async () => {
    if (
      isUndefined(historyLatest.current) ||
      isUndefined(stepLatest.current) ||
      stepLatest.current === historyLatest.current.length - 1
    ) {
      return;
    }

    const newStep = stepLatest.current + 1;
    const _schema = historyLatest.current[newStep];

    // 开始执行 redo
    setRedoUndoing(true);

    // 停止监听画布变化
    stopListen();

    // 保存 schema
    onChange?.(_schema);

    // 画布重新加载
    await loadFromJSON?.(_schema);

    // 同步 step
    setStep(newStep);

    // 恢复画布监听
    startListen();

    // redo 执行完成
    setRedoUndoing(false);
  }, [loadFromJSON]);

  const { run: pushOperation } = useDebounceFn(
    (_schema: FabricSchema) => {
      push(cloneDeep(_schema));
    },
    {
      wait: 300,
    },
  );

  return {
    pushOperation,
    undo: async () => {
      if (!redoUndoing) {
        await undo();
      }
    },
    redo: async () => {
      if (!redoUndoing) {
        await redo();
      }
    },
    disabledUndo: step === 0,
    disabledRedo: history && step === history.length - 1,
    redoUndoing,
  };
};
