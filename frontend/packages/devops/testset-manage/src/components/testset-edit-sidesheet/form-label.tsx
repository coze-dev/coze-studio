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

import { type CSSProperties } from 'react';

import cls from 'classnames';

import s from './form-label.module.less';

interface FormLabelProps {
  label: string;
  typeLabel?: string;
  required?: boolean;
  className?: string;
  style?: CSSProperties;
}

// The built-in FormLabel style does not support typeLabel, so it is easy to customize
export function FormLabel({
  label,
  typeLabel,
  required,
  className,
  style,
}: FormLabelProps) {
  return (
    <div className={cls(s.wrapper, className)} style={style}>
      <div className={cls(s.label, required && s.required)}>{label}</div>
      {typeLabel ? <div className={s['type-label']}>{typeLabel}</div> : null}
    </div>
  );
}
