/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface Filter {
  queryAndOr?: string;
  filterFields: Array<FilterField>;
}

export interface FilterField {
  field_name: string;
  field_type: string;
  values?: Array<string>;
  query_type?: string;
  query_and_or?: string;
  sub_filter?: Filter;
}
/* eslint-enable */
