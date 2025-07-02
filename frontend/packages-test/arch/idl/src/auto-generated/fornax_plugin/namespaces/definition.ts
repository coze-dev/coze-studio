/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface Definition {
  /** Type specifies the data type of the schema. */
  type: string;
  /** Description is the description of the schema. */
  description?: string;
  /** Enum is used to restrict a value to a fixed set of values. It must be an array with at least one element, where each element is unique. You will probably only use this with strings. */
  enum?: Array<string>;
  /** Properties describes the properties of an object, if the schema type is Object. */
  properties?: Record<string, Definition>;
  /** Required specifies which properties are required, if the schema type is Object. */
  required?: Array<string>;
  /** Items specifies which data type an array contains, if the schema type is Array. */
  items?: Definition;
}
/* eslint-enable */
