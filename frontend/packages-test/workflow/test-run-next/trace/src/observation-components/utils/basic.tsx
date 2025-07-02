import { StatusCode } from '../consts/basic';

export const getStandardStatusCode = (status: number) =>
  status === StatusCode.SUCCESS ? StatusCode.SUCCESS : StatusCode.ERROR;

export const isSuccessStatus = (status?: number) =>
  status === StatusCode.SUCCESS;
