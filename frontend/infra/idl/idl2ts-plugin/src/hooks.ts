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

export enum Phases {
  BEFORE = 'BEFORE',
  ON = 'ON',
  AFTER = 'AFTER',
}

export const phases = Object.values(Phases);

export const joinPhases = <T extends string>(phase: Phases, hook: T) =>
  `__${phase}__::${hook}`;

export const on = <T extends string>(hook: T) =>
  joinPhases(Phases.ON, hook) as `__ON__::${T}`;
export const before = <T extends string>(hook: T) =>
  joinPhases(Phases.BEFORE, hook) as `__BEFORE__::${T}`;
export const after = <T extends string>(hook: T) =>
  joinPhases(Phases.AFTER, hook) as `__AFTER__::${T}`;

export default Phases;
