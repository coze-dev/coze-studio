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
  // 将路径转为数组，以便统一处理
  if (Array.isArray(path)) {
    pathArray = path;
  } else {
    pathArray = parsePath(path);
  }

  // 通过路径在错误列表中查找对应的错误
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

  // 返回错误信息
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
