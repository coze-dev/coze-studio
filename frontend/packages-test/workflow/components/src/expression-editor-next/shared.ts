import {
  type MutableRefObject,
  useRef,
  useState,
  useLayoutEffect,
} from 'react';

import { dequal } from 'dequal';

import { ExpressionEditorParserBuiltin } from '@/expression-editor/parser';
import { ExpressionEditorSegmentType } from '@/expression-editor';

function useLatest<T>(value: T): MutableRefObject<T> {
  const ref = useRef(value);
  ref.current = value;

  return ref;
}

// 解除 parent 导致的循环依赖（否则无法深比较）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function cloneWithout(target: any, keys: string[]) {
  // target 为 undefined 时会抛错
  try {
    return JSON.parse(
      JSON.stringify(target, function (key, value) {
        if (keys.includes(key)) {
          return null;
        }

        return value;
      }),
    );
  } catch (e) {
    return target;
  }
}

function useDeepEqualMemo<T>(value: T): T {
  const [state, setState] = useState<T>(value);
  const lastValueRef = useRef<T>(value);

  useLayoutEffect(() => {
    if (
      !dequal(
        cloneWithout(value, ['parent']),
        cloneWithout(lastValueRef.current, ['parent']),
      )
    ) {
      setState(value);
      lastValueRef.current = value;
    }
  }, [value]);

  return state;
}

function generateUniqueId(): string {
  return Math.floor(Math.random() * 2e6).toString(36);
}

function getSearchValue(textBefore: string) {
  const segments = ExpressionEditorParserBuiltin.toSegments(textBefore);

  if (!segments) {
    return '';
  }

  const lastSegment =
    segments[segments.length - 1].type ===
    ExpressionEditorSegmentType.ArrayIndex
      ? segments[segments.length - 2] // 数组索引属于上一层级，需要去除防止影响到搜索值
      : segments[segments.length - 1];
  if (
    !lastSegment ||
    lastSegment.type !== ExpressionEditorSegmentType.ObjectKey
  ) {
    return '';
  }
  return lastSegment.objectKey;
}

export { useLatest, useDeepEqualMemo, getSearchValue, generateUniqueId };
