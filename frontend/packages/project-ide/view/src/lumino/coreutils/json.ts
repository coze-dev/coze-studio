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

// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2017, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/

/**
 * A type alias for a JSON primitive.
 */
export type JSONPrimitive = boolean | number | string | null;

/**
 * A type alias for a JSON value.
 */
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;

/**
 * A type definition for a JSON object.
 */
export interface JSONObject {
  [key: string]: JSONValue;
}

/**
 * A type definition for a JSON array.
 */
export interface JSONArray extends Array<JSONValue> {}

/**
 * A type definition for a readonly JSON object.
 */
export interface ReadonlyJSONObject {
  readonly [key: string]: ReadonlyJSONValue;
}

/**
 * A type definition for a readonly JSON array.
 */
export interface ReadonlyJSONArray extends ReadonlyArray<ReadonlyJSONValue> {}

/**
 * A type alias for a readonly JSON value.
 */
export type ReadonlyJSONValue =
  | JSONPrimitive
  | ReadonlyJSONObject
  | ReadonlyJSONArray;

/**
 * A type alias for a partial JSON value.
 *
 * Note: Partial here means that JSON object attributes can be `undefined`.
 */
export type PartialJSONValue =
  | JSONPrimitive
  | PartialJSONObject
  | PartialJSONArray;

/**
 * A type definition for a partial JSON object.
 *
 * Note: Partial here means that the JSON object attributes can be `undefined`.
 */
export interface PartialJSONObject {
  [key: string]: PartialJSONValue | undefined;
}

/**
 * A type definition for a partial JSON array.
 *
 * Note: Partial here means that JSON object attributes can be `undefined`.
 */
export interface PartialJSONArray extends Array<PartialJSONValue> {}

/**
 * A type definition for a readonly partial JSON object.
 *
 * Note: Partial here means that JSON object attributes can be `undefined`.
 */
export interface ReadonlyPartialJSONObject {
  readonly [key: string]: ReadonlyPartialJSONValue | undefined;
}

/**
 * A type definition for a readonly partial JSON array.
 *
 * Note: Partial here means that JSON object attributes can be `undefined`.
 */
export interface ReadonlyPartialJSONArray
  extends ReadonlyArray<ReadonlyPartialJSONValue> {}

/**
 * A type alias for a readonly partial JSON value.
 *
 * Note: Partial here means that JSON object attributes can be `undefined`.
 */
export type ReadonlyPartialJSONValue =
  | JSONPrimitive
  | ReadonlyPartialJSONObject
  | ReadonlyPartialJSONArray;

/**
 * The namespace for JSON-specific functions.
 */
export namespace JSONExt {
  /**
   * A shared frozen empty JSONObject
   */
  export const emptyObject = Object.freeze({}) as ReadonlyJSONObject;

  /**
   * A shared frozen empty JSONArray
   */
  export const emptyArray = Object.freeze([]) as ReadonlyJSONArray;

  /**
   * Test whether a JSON value is a primitive.
   *
   * @param value - The JSON value of interest.
   *
   * @returns `true` if the value is a primitive,`false` otherwise.
   */
  export function isPrimitive(
    value: ReadonlyPartialJSONValue,
  ): value is JSONPrimitive {
    return (
      value === null ||
      typeof value === 'boolean' ||
      typeof value === 'number' ||
      typeof value === 'string'
    );
  }

  /**
   * Test whether a JSON value is an array.
   *
   * @param value - The JSON value of interest.
   *
   * @returns `true` if the value is a an array, `false` otherwise.
   */
  export function isArray(value: JSONValue): value is JSONArray;
  export function isArray(value: ReadonlyJSONValue): value is ReadonlyJSONArray;
  export function isArray(value: PartialJSONValue): value is PartialJSONArray;
  export function isArray(
    value: ReadonlyPartialJSONValue,
  ): value is ReadonlyPartialJSONArray;
  export function isArray(value: ReadonlyPartialJSONValue): boolean {
    return Array.isArray(value);
  }

  /**
   * Test whether a JSON value is an object.
   *
   * @param value - The JSON value of interest.
   *
   * @returns `true` if the value is a an object, `false` otherwise.
   */
  export function isObject(value: JSONValue): value is JSONObject;
  export function isObject(
    value: ReadonlyJSONValue,
  ): value is ReadonlyJSONObject;
  export function isObject(value: PartialJSONValue): value is PartialJSONObject;
  export function isObject(
    value: ReadonlyPartialJSONValue,
  ): value is ReadonlyPartialJSONObject;
  export function isObject(value: ReadonlyPartialJSONValue): boolean {
    return !isPrimitive(value) && !isArray(value);
  }

  /**
   * Compare two JSON values for deep equality.
   *
   * @param first - The first JSON value of interest.
   *
   * @param second - The second JSON value of interest.
   *
   * @returns `true` if the values are equivalent, `false` otherwise.
   */
  export function deepEqual(
    first: ReadonlyPartialJSONValue,
    second: ReadonlyPartialJSONValue,
  ): boolean {
    // Check referential and primitive equality first.
    if (first === second) {
      return true;
    }

    // If one is a primitive, the `===` check ruled out the other.
    if (isPrimitive(first) || isPrimitive(second)) {
      return false;
    }

    // Test whether they are arrays.
    const a1 = isArray(first);
    const a2 = isArray(second);

    // Bail if the types are different.
    if (a1 !== a2) {
      return false;
    }

    // If they are both arrays, compare them.
    if (a1 && a2) {
      return deepArrayEqual(
        first as ReadonlyPartialJSONArray,
        second as ReadonlyPartialJSONArray,
      );
    }

    // At this point, they must both be objects.
    return deepObjectEqual(
      first as ReadonlyPartialJSONObject,
      second as ReadonlyPartialJSONObject,
    );
  }

  /**
   * Create a deep copy of a JSON value.
   *
   * @param value - The JSON value to copy.
   *
   * @returns A deep copy of the given JSON value.
   */
  export function deepCopy<T extends ReadonlyPartialJSONValue>(value: T): T {
    // Do nothing for primitive values.
    if (isPrimitive(value)) {
      return value;
    }

    // Deep copy an array.
    if (isArray(value)) {
      return deepArrayCopy(value);
    }

    // Deep copy an object.
    return deepObjectCopy(value);
  }

  /**
   * Compare two JSON arrays for deep equality.
   */
  function deepArrayEqual(
    first: ReadonlyPartialJSONArray,
    second: ReadonlyPartialJSONArray,
  ): boolean {
    // Check referential equality first.
    if (first === second) {
      return true;
    }

    // Test the arrays for equal length.
    if (first.length !== second.length) {
      return false;
    }

    // Compare the values for equality.
    for (let i = 0, n = first.length; i < n; ++i) {
      if (!deepEqual(first[i], second[i])) {
        return false;
      }
    }

    // At this point, the arrays are equal.
    return true;
  }

  /**
   * Compare two JSON objects for deep equality.
   */
  function deepObjectEqual(
    first: ReadonlyPartialJSONObject,
    second: ReadonlyPartialJSONObject,
  ): boolean {
    // Check referential equality first.
    if (first === second) {
      return true;
    }

    // Check for the first object's keys in the second object.
    for (const key in first) {
      if (first[key] !== undefined && !(key in second)) {
        return false;
      }
    }

    // Check for the second object's keys in the first object.
    for (const key in second) {
      if (second[key] !== undefined && !(key in first)) {
        return false;
      }
    }

    // Compare the values for equality.
    for (const key in first) {
      // Get the values.
      const firstValue = first[key];
      const secondValue = second[key];

      // If both are undefined, ignore the key.
      if (firstValue === undefined && secondValue === undefined) {
        continue;
      }

      // If only one value is undefined, the objects are not equal.
      if (firstValue === undefined || secondValue === undefined) {
        return false;
      }

      // Compare the values.
      if (!deepEqual(firstValue, secondValue)) {
        return false;
      }
    }

    // At this point, the objects are equal.
    return true;
  }

  /**
   * Create a deep copy of a JSON array.
   */
  function deepArrayCopy(value: any): any {
    const result = new Array<any>(value.length);
    for (let i = 0, n = value.length; i < n; ++i) {
      result[i] = deepCopy(value[i]);
    }
    return result;
  }

  /**
   * Create a deep copy of a JSON object.
   */
  function deepObjectCopy(value: any): any {
    const result: any = {};
    for (const key in value) {
      // Ignore undefined values.
      const subvalue = value[key];
      if (subvalue === undefined) {
        continue;
      }
      result[key] = deepCopy(subvalue);
    }
    return result;
  }
}
