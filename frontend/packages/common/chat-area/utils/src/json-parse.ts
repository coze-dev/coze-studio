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

export const typeSafeJsonParse = (
  str: string,
  onParseError: (error: Error) => void,
): unknown => {
  try {
    return JSON.parse(str);
  } catch (e) {
    onParseError(e as Error);
    return null;
  }
};

/**
 * Generic type annotations may require the use of type declarations.
 * refer: https://github.com/microsoft/TypeScript/issues/15300.
 */
export const typeSafeJsonParseEnhanced = <T>({
  str,
  onParseError,
  verifyStruct,
  onVerifyError,
}: {
  str: string;
  onParseError: (error: Error) => void;
  /**
   * Implement a type check that returns whether it passes (boolean); in fact, it depends on self-awareness.
   * It can be defined separately or written as an internal connection function, but note that the return value is marked as predicate,
   * refer: https://github.com/microsoft/TypeScript/issues/38390.
   */
  verifyStruct: (sth: unknown) => sth is T;
  /** Error cause: validation crashed; validation failed */
  onVerifyError: (error: Error) => void;
}): T | null => {
  const res = typeSafeJsonParse(str, onParseError);

  function assertStruct(resLocal: unknown): asserts resLocal is T {
    const ok = verifyStruct(resLocal);
    if (!ok) {
      throw new Error('verify struct no pass');
    }
  }

  try {
    assertStruct(res);
    return res;
  } catch (e) {
    onVerifyError(e as Error);
    return null;
  }
};
