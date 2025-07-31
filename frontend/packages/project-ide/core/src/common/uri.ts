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

import { URI as Uri } from 'vscode-uri';

import { prioritizeAllSync, prioritizeAll } from './prioritizeable';
import { Path } from './path';

export class URI {
  private readonly codeUri: Uri;

  constructor(uri: string | Uri = '') {
    if (uri instanceof Uri) {
      this.codeUri = uri;
    } else {
      this.codeUri = Uri.parse(uri);
    }
  }

  private _path: Path | undefined;

  get path(): Path {
    if (this._path === undefined) {
      this._path = new Path(this.codeUri.path);
    }
    return this._path;
  }

  get displayName(): string {
    const { base } = this.path;
    if (base) {
      return base;
    }
    if (this.path.isRoot) {
      return this.path.toString();
    }
    return '';
  }

  /**
   * Return all uri from the current to the top most.
   */
  get allLocations(): URI[] {
    const locations: URI[] = [];
    let location: URI = this;
    while (!location.path.isRoot && location.path.hasDir) {
      locations.push(location);
      location = location.parent;
    }
    locations.push(location);
    return locations;
  }

  get parent(): URI {
    if (this.path.isRoot) {
      return this;
    }
    return this.withPath(this.path.dir);
  }

  get scheme(): string {
    return this.codeUri.scheme;
  }

  get authority(): string {
    return this.codeUri.authority;
  }

  get query(): string {
    return this.codeUri.query;
  }

  get fragment(): string {
    return this.codeUri.fragment;
  }

  get queryObject(): { [key: string]: string | undefined } {
    return URI.queryStringToObject(this.query);
  }

  static getDistinctParents(uris: URI[]): URI[] {
    const result: URI[] = [];
    uris.forEach((uri, i) => {
      if (
        !uris.some(
          (otherUri, index) => index !== i && otherUri.isEqualOrParent(uri),
        )
      ) {
        result.push(uri);
      }
    });
    return result;
  }

  relative(uri: URI): Path | undefined {
    if (this.authority !== uri.authority || this.scheme !== uri.scheme) {
      return undefined;
    }
    return this.path.relative(uri.path);
  }

  resolve(path: string | Path): URI {
    return this.withPath(this.path.join(path.toString()));
  }

  /**
   * return a new URI replacing the current with the given scheme
   */
  withScheme(scheme: string): URI {
    const newCodeUri = Uri.from({
      ...this.codeUri.toJSON(),
      scheme,
    });
    return new URI(newCodeUri);
  }

  /**
   * return a new URI replacing the current with the given authority
   */
  withAuthority(authority: string): URI {
    const newCodeUri = Uri.from({
      ...this.codeUri.toJSON(),
      scheme: this.codeUri.scheme,
      authority,
    });
    return new URI(newCodeUri);
  }

  /**
   * return this URI without a authority
   */
  withoutAuthority(): URI {
    return this.withAuthority('');
  }

  /**
   * return a new URI replacing the current with the given path
   */
  withPath(path: string | Path): URI {
    const newCodeUri = Uri.from({
      ...this.codeUri.toJSON(),
      scheme: this.codeUri.scheme,
      path: path.toString(),
    });
    return new URI(newCodeUri);
  }

  /**
   * return this URI without a path
   */
  withoutPath(): URI {
    return this.withPath('');
  }

  /**
   * return a new URI replacing the current with the given query
   */
  withQuery(query: string): URI {
    const newCodeUri = Uri.from({
      ...this.codeUri.toJSON(),
      scheme: this.codeUri.scheme,
      query,
    });
    return new URI(newCodeUri);
  }

  addQueryObject(queryObj: { [key: string]: string | undefined }): URI {
    queryObj = { ...this.queryObject, ...queryObj };
    return this.withQuery(URI.objectToQueryString(queryObj));
  }

  removeQueryObject(key: string): URI {
    const queryObj = { ...this.queryObject } as { [key: string]: string };
    if (key in queryObj) {
      delete queryObj[key];
    }
    return this.withQuery(URI.objectToQueryString(queryObj));
  }

  /**
   * return this URI without a query
   */
  withoutQuery(): URI {
    return this.withQuery('');
  }

  /**
   * return a new URI replacing the current with the given fragment
   */
  withFragment(fragment: string): URI {
    const newCodeUri = Uri.from({
      ...this.codeUri.toJSON(),
      scheme: this.codeUri.scheme,
      fragment,
    });
    return new URI(newCodeUri);
  }

  /**
   * return this URI without a fragment
   */
  withoutFragment(): URI {
    return this.withFragment('');
  }

  /**
   * return a new URI replacing the current with its normalized path, resolving '..' and '.' segments
   */
  normalizePath(): URI {
    return this.withPath(this.path.normalize());
  }

  toString(): string {
    return `${this.scheme}://${this.authority}${this.path.toString()}${
      this.query ? `?${this.query}` : ''
    }${this.fragment ? `#${this.fragment}` : ''}`;
  }

  isEqualOrParent(uri: URI | string): boolean {
    uri = typeof uri === 'string' ? new URI(uri) : uri;
    return (
      this.authority === uri.authority &&
      this.scheme === uri.scheme &&
      this.path.isEqualOrParent(uri.path)
    );
  }

  match(uri: URI) {
    const path = `/${uri.authority}${uri.path.toString()}`;
    const params: any[] = [];
    const pattern = `/${this.authority}${this.path.toString()}`; // Start with/
    let regexpSource = pattern
      .replace(/\/*\*?$/, '') // remove the/and/* at the endnd/* at the end
      .replace(/[\\. *+ ^ ${} | () [\]]/g, '\\ $&') //Translate some special characterse some special characters
      .replace(/\/:([\w-]+)(\?)?/g, (_, paramName, optional) => {
        //Collect the parameters on the url/: param/,/: param?/RL/: param/,/: param?/
        params.push({
          paramName,
          // eslint-disable-next-line eqeqeq
          optional: optional != null,
        });
        // Is it an optional parameter?n optional parameter?
        return optional ? '/?([^\\/]+)?' : '/([^\\/]+)';
      });
    if (pattern.endsWith('*')) {
      params.push({ paramName: '*' });
      //Maybe the path is only *e path is only *
      regexpSource += pattern === '/*' ? '(.*)$' : '(?:\\/(.+)|\\/*)$';
    } else {
      regexpSource += '\\/*$';
    }
    const matcher = new RegExp(regexpSource);
    return !!path.match(matcher);
  }
}

export interface URIHandler {
  canHandle: (uri: URI) => number | boolean;
}

export namespace URIHandler {
  /**
   * Upper level registration has the highest priority
   */
  export const MAX_PRIORITY = 500;
  /**
   * Default bottom line
   */
  export const DEFAULT_PRIORITY = 0;

  /**
   * prioritization
   * @param uri
   * @param handlers
   */
  export async function findAsync<T extends URIHandler>(
    uri: URI,
    handlers: T[],
  ): Promise<T> {
    const prioritized = await prioritizeAll<T>(handlers, async handler => {
      const priority = handler.canHandle(uri);
      // In the boolean case, 500 is used by default.
      if (typeof priority === 'boolean') {
        return priority ? MAX_PRIORITY : DEFAULT_PRIORITY;
      }
      return priority;
    });
    return prioritized[0]?.value as T;
  }
  export function findSync<T extends URIHandler>(uri: URI, handlers: T[]): T {
    const prioritized = prioritizeAllSync<T>(handlers, handler => {
      const priority = handler.canHandle(uri);
      // In the boolean case, 500 is used by default.
      if (typeof priority === 'boolean') {
        return priority ? MAX_PRIORITY : DEFAULT_PRIORITY;
      }
      return priority;
    });
    return prioritized[0]?.value as T;
  }
}

export namespace URI {
  export function objectToQueryString(obj?: {
    [key: string]: string | undefined;
  }): string {
    if (!obj) {
      return '';
    }
    return Object.keys(obj)
      .map(key => `${key}=${obj[key] || ''}`)
      .join('&');
  }

  export function queryStringToObject(queryString: string): {
    [key: string]: string | undefined;
  } {
    return queryString.split('&').reduce((obj, key: string) => {
      const [k, value] = key.split('=');
      obj[k] = value;
      return obj;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, {} as any);
  }

  export function isSubPath(target: string, source: string): boolean {
    const targetURI = new URI(target);
    const sourceURI = new URI(source);
    return sourceURI.path.isEqualOrParent(targetURI.path);
  }

  export function isURIStringEqual(target: string, source: string): boolean {
    const targetURI = new URI(target);
    const sourceURI = new URI(source);
    return sourceURI.toString() === targetURI.toString();
  }

  export function isSubOrEqual(target: string, source: string): boolean {
    return isSubPath(target, source) || isURIStringEqual(target, source);
  }
}
