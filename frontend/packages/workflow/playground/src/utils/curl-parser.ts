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

/** Exporting directly from yargs-parser will cause an error because the browser environment is not supported */
import yargsParser from 'yargs-parser/browser';
import multipart from 'parse-multipart';
import { cloneDeep } from 'lodash-es';

interface ParsedResult {
  url: string;
  originPath: string;
  method: string;
  params: Record<string, string>;
  headers: Record<string, string>;
  query: Record<string, string>;
  body: string | Record<string, string> | undefined;
}

class CURLParser {
  cURLStr: string;

  yargObj: Record<string, string | string[] | Record<string, string> | Buffer>;
  constructor(cURLStr: string) {
    this.cURLStr = cURLStr;
    const yargObj = yargsParser(this.pretreatment(cURLStr));
    this.yargObj = yargObj;
  }
  pretreatment(cURLStr: string) {
    if (!cURLStr.startsWith('curl')) {
      throw new Error('curl syntax error');
    }
    // Delete newline
    const newLineFound = /\r|\n/.exec(cURLStr);
    if (newLineFound) {
      cURLStr = cURLStr.replace(/\\\r|\\\n/g, '');
    }
    // Change to universal spelling
    cURLStr = cURLStr.replace(/ -XPOST/, ' -X POST');
    cURLStr = cURLStr.replace(/ -XGET/, ' -X GET');
    cURLStr = cURLStr.replace(/ -XPUT/, ' -X PUT');
    cURLStr = cURLStr.replace(/ -XPATCH/, ' -X PATCH');
    cURLStr = cURLStr.replace(/ -XDELETE/, ' -X DELETE');
    cURLStr = cURLStr.replace(/ --header/g, ' -H');
    cURLStr = cURLStr.replace(/ --user-agent/g, ' -A');
    cURLStr = cURLStr.replace(/ --request/g, ' -X');
    cURLStr = cURLStr.replace(
      / --(data-binary|data-raw|data|data-urlencode)/g,
      ' -d',
    );
    cURLStr = cURLStr.replace(/ --form/g, ' -f');
    cURLStr = cURLStr.trim();
    cURLStr = cURLStr.replace(/^curl/, '');
    return cURLStr;
  }
  /** If there are two identical arguments written by mistake, take the last one */
  getFirstItem(key: string) {
    const e = this.yargObj[key];
    if (!Array.isArray(e)) {
      return e;
    }
    return e[e.length - 1] || '';
  }
  transKeyValueArrayToObj(keyValueArray: string[] | string) {
    const keyValueObj = {};
    let keyValueArr = cloneDeep(keyValueArray);
    if (!Array.isArray(keyValueArr)) {
      keyValueArr = [keyValueArr] as string[];
    }
    keyValueArr.forEach((item: string) => {
      const arr = item.split('=');
      try {
        keyValueObj[arr[0]] = JSON.parse(arr[1]);
      } catch (error) {
        keyValueObj[arr[0]] = arr[1];
      }
    });

    return keyValueObj;
  }
  getUrl() {
    const { yargObj } = this;
    let uri = '';
    uri = yargObj._[0];
    if (yargObj.url) {
      uri = yargObj.url as string;
    }
    if (!uri) {
      Object.values(yargObj).forEach(e => {
        if (typeof e !== 'string') {
          return;
        }
        if (e.startsWith('http') || e.startsWith('www.')) {
          uri = e;
        }
      });
    }
    return uri.replace(/['"]+/g, '');
  }
  getQuery(uri: string) {
    const params = {};
    try {
      const obj = new URL(uri);
      if (!obj?.searchParams) {
        return params;
      }
      for (const [key, value] of obj.searchParams) {
        params[key] = value;
      }
      return params;
    } catch (error) {
      return {};
    }
  }
  getHeaders() {
    const { yargObj } = this;
    const headers = {};
    if (!Reflect.has(yargObj, 'H')) {
      return headers;
    }
    let yargHeaders = yargObj.H;
    if (!Array.isArray(yargHeaders)) {
      yargHeaders = [yargHeaders] as string[];
    }
    yargHeaders.forEach((item: string) => {
      const i = item.indexOf(':');
      const name = item.substring(0, i).trim();
      const val = item.substring(i + 1).trim();
      headers[name] = val;
    });
    if (Reflect.has(yargObj, 'A')) {
      headers['user-agent'] = this.getFirstItem('A');
    }
    return headers;
  }
  getMethods() {
    const { yargObj } = this;
    let me = this.getFirstItem('X');
    if (me) {
      return (me as string).toUpperCase();
    }
    if (Reflect.has(yargObj, 'F')) {
      if (!yargObj.F) {
        // If there is a -F parameter but it is empty, it is an error curl.
        throw new Error('curl -F params syntax error');
      }
      return 'POST';
    }
    if (Reflect.has(yargObj, 'f')) {
      if (!yargObj.f) {
        // If the --form parameter exists but is empty, it is an error curl.
        throw new Error('curl --form params syntax error');
      }
      return 'POST';
    }
    if (Reflect.has(yargObj, 'd')) {
      // Scenes where the --data parameter exists, but the value is empty, the default is a GET request
      me = !yargObj?.d ? 'GET' : 'POST';
    }
    return (me ?? ('GET' as string)).toUpperCase();
  }
  getBody(headers: Record<string, string>) {
    const contentType = headers['content-type'] || headers['Content-Type'];
    let type = 'Empty';
    let data = this.yargObj?.d;
    if (contentType) {
      if (contentType.indexOf('json') > -1) {
        type = 'application/json';
      } else if (contentType.indexOf('urlencoded') > -1) {
        type = 'application/x-www-form-urlencoded';
      } else if (this.cURLStr.indexOf('--data-urlencoded') > -1) {
        type = 'application/x-www-form-urlencoded';
      } else if (
        Array.isArray(data) &&
        type !== 'application/x-www-form-urlencoded'
      ) {
        type = 'application/x-www-form-urlencoded';
        data = data.join('&');
      } else if (contentType.indexOf('form-data') > -1) {
        type = 'multipart/form-data';
        let boundary = '';
        const match = contentType.match(/boundary=.+/);
        if (!match) {
          type = 'text/plain';
        } else {
          boundary = match[0].slice(9);
          try {
            const parts = multipart.Parse(
              (data ?? this.yargObj.F ?? '') as Buffer,
              boundary,
            );
            if (parts?.length) {
              this.yargObj.F = parts.map(
                item => `${item.filename}=${item.data}`,
              );
            }
          } catch (error) {
            type = 'text/plain';
          }
        }
      } else if (contentType.indexOf('application/octet-stream') > -1) {
        type = 'application/octet-stream';
      }
      if (this.yargObj.F) {
        type = 'multipart/form-data';
      }
    } else {
      // --data "key=value"
      const paramsD = this.yargObj?.d;
      // -F "file_field=@/path/to/local/file.txt"
      // --form 'str="123"'
      const paramsF = this.yargObj?.F ?? this.yargObj?.f;
      if (typeof paramsF === 'string' && paramsF) {
        type = 'multipart/form-data';
      } else if (typeof paramsD === 'string' && paramsD) {
        try {
          JSON.parse(paramsD);
          type = 'application/json';
        } catch (error) {
          // Type takes form-urlencoded when data is not a json string
          type = 'application/x-www-form-urlencoded';
        }
      }
    }
    let body: string | Record<string, string> | undefined;
    const formData = this.yargObj?.f ?? this.yargObj?.F;
    const formParamData = this.yargObj?.f;
    switch (type) {
      case 'application/json':
        try {
          body = JSON.parse(data as string);
        } catch (error) {
          body = data as string;
        }
        break;
      case 'application/x-www-form-urlencoded':
        if (data) {
          try {
            const urlSearchParams = new URLSearchParams(data as string);
            const params = {};
            for (const [key, value] of urlSearchParams) {
              params[key] = value;
            }
            body = params;
          } catch (error) {
            body = data as string;
          }
        } else if (formParamData) {
          body = this.transKeyValueArrayToObj(
            formParamData as string[] | string,
          );
        }
        break;
      case 'multipart/form-data':
        if (formData) {
          body = this.transKeyValueArrayToObj(formData as string[] | string);
        }
        break;
      case 'application/octet-stream':
        body = data as string;
        break;
      default:
        body = undefined;
        break;
    }
    const requestBody = {
      type,
      data: body,
    };
    return requestBody;
  }
  parse() {
    const uri = this.getUrl();
    const headers = this.getHeaders();
    const method = this.getMethods();
    const obj = new URL(uri);
    const res: ParsedResult = {
      url: uri,
      originPath: obj?.origin + obj?.pathname,
      params: {},
      method,
      headers,
      query: this.getQuery(uri),
      body: this.getBody(headers) as Record<string, string>,
    };
    return res;
  }
}

export { CURLParser, ParsedResult };
