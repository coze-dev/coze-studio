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

import {
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import queryString, {
  type ParseOptions,
  type StringifyOptions,
} from 'query-string';
import { omit as _omit } from 'lodash-es';
import useBoolean from '../use-boolean';

export interface ReturnValue<T> {
  value: T;
  setValue: Dispatch<SetStateAction<T>>;
  resetParams: (initial?: boolean) => void;
}

export interface KeyValue {
  [key: string]: any;
}

export type KeysObj<T> = {
  [key in keyof T]: any;
};

interface AutoMergeUrlParamsOptions {
  useUrlParamsOnFirst: boolean;
}

interface IOptions {
  omitKeys?: string[]; // Fields that are not displayed in the url but will still be passed to the final returned value
  autoFormat?: boolean;
  autoMergeUrlParamsOptions?: AutoMergeUrlParamsOptions;
  autoMergeUrlParams?: boolean;
  parseOptions?: ParseOptions;
  stringifyOptions?: StringifyOptions;
  replaceUrl?: boolean; // Determines if the URL will be replaced or pushed in the browser history
}

const _toString = Object.prototype.toString;

function isObject(val: any) {
  return val !== null && typeof val === 'object';
}

function isDate(val: any) {
  return _toString.call(val) === '[object Date]';
}

function formatValueFn<T>(obj: T, autoFormat: boolean): KeysObj<T> {
  if (autoFormat) {
    const formatValue = {} as KeysObj<T>;

    for (const key in obj) {
      const val = obj[key] as any;
      if (val === '' || val === undefined || val === null) {
        continue;
      }
      if (Array.isArray(val)) {
        formatValue[key] = val;
      } else if (isDate(val)) {
        formatValue[key] = val.toISOString();
      } else if (isObject(val)) {
        formatValue[key] = JSON.stringify(val);
      } else {
        formatValue[key] = val;
      }
    }

    return formatValue;
  } else {
    return obj;
  }
}

// The first initialization is url merge defaultValue, then subsequent setValue merges url with value
// eslint-disable-next-line max-params
function getMergeValue<T>(
  value: T,
  parseOptions: ParseOptions,
  autoMergeUrlParams: boolean,
  isFirstMerged: boolean,
  autoMergeUrlParamsOptions: AutoMergeUrlParamsOptions,
) {
  let mergeValue = (isObject(value) ? { ...value } : ({} as T)) as Record<
    string,
    unknown
  >;

  if (autoMergeUrlParams) {
    if (isFirstMerged) {
      mergeValue = Object.assign(
        mergeValue,
        queryString.parse(window.location.search, parseOptions),
      );
    } else {
      mergeValue = Object.assign(
        queryString.parse(window.location.search, parseOptions),
        mergeValue,
      );
    }
  } else {
    if (isFirstMerged && autoMergeUrlParamsOptions?.useUrlParamsOnFirst) {
      mergeValue = Object.assign(
        mergeValue,
        queryString.parse(window.location.search, parseOptions),
      );
    }
  }
  return mergeValue as T;
}

// Initialize initValue The value value in it may have a number type, which will be converted to Object in the url and all converted to string. You need to deal with it yourself.
// The value in the initialization initValue may be a number,
// which will be converted into an Object in the url and all converted into a string, which needs to be processed manually.
function useUrlParams<T>(
  initValue: T = {} as T,
  options?: IOptions,
): ReturnValue<T> {
  const {
    omitKeys,
    autoFormat,
    autoMergeUrlParams,
    parseOptions,
    stringifyOptions,
    replaceUrl,
    autoMergeUrlParamsOptions,
  } = Object.assign(
    {
      omitKeys: [],
      autoFormat: false,
      autoMergeUrlParams: true,
      autoMergeUrlParamsOptions: {
        useUrlParamsOnFirst: false,
      },
      parseOptions: { arrayFormat: 'bracket' },
      stringifyOptions: {
        skipNull: true,
        skipEmptyString: true,
        arrayFormat: 'bracket',
      },
      replaceUrl: true,
    },
    options,
  );

  const [value, setValue] = useState<T>(
    getMergeValue(
      initValue,
      parseOptions,
      autoMergeUrlParams,
      true,
      autoMergeUrlParamsOptions,
    ),
  );

  const {
    state: isPopping,
    setTrue: setPoppingTrue,
    setFalse: setPoppingFalse,
  } = useBoolean(false);

  const initialValueRef = useRef<T>(value);
  const isFirstMerged = useRef<boolean>(true);

  const resetParams = useCallback((initial = true) => {
    if (initial) {
      setValue(initialValueRef.current!);
    } else {
      setValue(queryString.parse(window.location.search, parseOptions) as any);
    }
  }, []);

  const formatValue = useMemo<KeysObj<T>>(
    () => formatValueFn<T>(value, autoFormat),
    [value],
  );

  useEffect(() => {
    const fn = () => {
      setPoppingTrue();
    };
    window.addEventListener('popstate', fn);
    return () => {
      window.removeEventListener('popstate', fn);
    };
  }, []);

  useEffect(() => {
    if (isPopping) {
      setValue(queryString.parse(window.location.search, parseOptions) as any);
    }
  }, [isPopping]);

  useEffect(() => {
    const { href, search, hash } = window.location;

    let mergeValue;
    if (isFirstMerged.current) {
      isFirstMerged.current = false;
      mergeValue = formatValue;
    } else {
      mergeValue = getMergeValue(
        formatValue,
        parseOptions,
        autoMergeUrlParams,
        isFirstMerged.current,
        autoMergeUrlParamsOptions,
      );
    }

    const searchStr = queryString.stringify(
      _omit(mergeValue, omitKeys),
      stringifyOptions,
    );
    const url = `${href.replace(hash, '').replace(search, '')}${
      searchStr ? `?${searchStr}` : ''
    }${hash}`;

    if (replaceUrl) {
      window.history.replaceState(
        { ...window.history.state, url, title: document.title },
        document.title,
        url,
      );
    } else if (!isPopping) {
      window.history.pushState(
        { ...window.history.state, url, title: document.title },
        document.title,
        url,
      );
    } else {
      // we are popping state, reset to false
      setPoppingFalse();
    }
  }, [formatValue]);

  return { value: formatValue, setValue, resetParams };
}

export default useUrlParams;
