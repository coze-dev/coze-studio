// eslint-disable unicorn/filename-case
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

/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum BotTableRWMode {
  /** single user mode */
  LimitedReadWrite = 1,
  /** read-only mode */
  ReadOnly = 2,
  /** multi-user mode */
  UnlimitedReadWrite = 3,
  /** Max boundary value */
  RWModeMax = 4,
}

export enum BotTableStatus {
  /** Initialization (not available) */
  Init = 0,
  /** It's online now. */
  Online = 1,
  /** delete */
  Delete = 2,
  /** Draft status (not published) */
  Draft = 3,
}

export enum FieldItemType {
  /** Text */
  Text = 1,
  /** number */
  Number = 2,
  /** time */
  Date = 3,
  /** float */
  Float = 4,
  /** bool */
  Boolean = 5,
}

/** Table model related constants, structure definitions */
export enum FieldType {
  /** Text */
  Text = 1,
  /** number */
  Number = 2,
  /** time */
  Date = 3,
  /** float */
  Float = 4,
  /** bool */
  Boolean = 5,
}

export enum ImportFileTaskStatus {
  /** task initialization */
  Init = 1,
  /** Task in progress */
  Enqueue = 2,
  /** Mission successful */
  Succeed = 3,
  /** Mission failed */
  Failed = 4,
}

export enum Language {
  /** Chinese */
  Chinese = 1,
  /** English */
  English = 2,
}

export enum TableType {
  /** draft */
  DraftTable = 1,
  /** online */
  OnlineTable = 2,
}

export interface FieldItem {
  /** Field name, user-defined, possibly in Chinese */
  name: string;
  desc?: string;
  type: FieldItemType;
  must_required?: boolean;
  /** Field Id, server level generated, globally unique (added as 0) */
  id?: Int64;
  /** Field Name Language Type */
  lang?: Language;
  /** Physical field name, server level generation, unique under a single table */
  physics_name?: string;
  /** Whether primary key */
  primary_key?: boolean;
  /** Field visibility, 1: user-defined; 2: business definition, visible to users; 3: business definition, hidden from users */
  visibility?: number;
  /** Used in an excel document, map to the corresponding column in excel */
  sequence?: string;
  /** Business custom extension field metadata */
  map_ext_meta?: Record<string, string>;
}
/* eslint-enable */
