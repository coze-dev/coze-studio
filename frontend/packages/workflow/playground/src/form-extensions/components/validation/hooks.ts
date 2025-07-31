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

import { useContext } from 'react';

import { REPORT_EVENTS } from '@coze-arch/report-events';
import { CustomError } from '@coze-arch/bot-error';

import { type ValidationError } from './type';
import { ValidationContext } from './context';

function parsePath(stringPath: string): (string | number)[] {
  return stringPath
    .split(/[\.\[\]]/)
    .filter(Boolean)
    .map(item => (isNaN(Number(item)) ? item : Number(item)));
}

export const useError = (
  path: string | (string | number)[],
): string | undefined => {
  const context = useContext(ValidationContext);

  if (!context) {
    throw new CustomError(
      REPORT_EVENTS.parmasValidation,
      'useError must be used within a ValidationProvider',
    );
  }

  const { errors } = context;

  if (!errors) {
    return undefined;
  }

  let pathArray;
  // Convert the path to an array for unified processing
  if (Array.isArray(path)) {
    pathArray = path;
  } else {
    pathArray = parsePath(path);
  }

  // Find the corresponding error in the error list through the path
  const findErrorInPath = (
    errorPath: (string | number)[],
  ): ValidationError | undefined =>
    errors.find(error => {
      if (Array.isArray(error.path)) {
        return (
          error.path.length === errorPath.length &&
          error.path.every((segment, index) => segment === errorPath[index])
        );
      }

      return error.path === errorPath[0];
    });

  const error = findErrorInPath(pathArray);

  // Return error message
  return error ? error.message : undefined;
};

export const useOnTestRunValidate = () => {
  const context = useContext(ValidationContext);

  if (!context) {
    throw new CustomError(
      REPORT_EVENTS.parmasValidation,
      'useError must be used within a ValidationProvider',
    );
  }

  const { onTestRunValidate } = context;

  return onTestRunValidate;
};
