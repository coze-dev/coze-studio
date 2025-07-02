import { type StandardNodeType } from '@coze-workflow/base';

import {
  SETTING_ON_ERROR_DYNAMIC_PORT_NODES,
  SETTING_ON_ERROR_NODES,
  SETTING_ON_ERROR_V2_NODES,
} from './constants';

/**
 * 是不是v2版本的节点
 * @param type
 * @returns
 */
export const isSettingOnErrorV2 = (type?: StandardNodeType) =>
  type && SETTING_ON_ERROR_V2_NODES.includes(type);

/**
 * 是不是开启异常设置的节点
 * @param type
 * @returns
 */
export const isSettingOnError = (type?: StandardNodeType) =>
  type && SETTING_ON_ERROR_NODES.includes(type);

/**
 * 是不是动态通道的节点
 * @param type
 * @returns
 */
export const isSettingOnErrorDynamicPort = (type?: StandardNodeType) =>
  type && SETTING_ON_ERROR_DYNAMIC_PORT_NODES.includes(type);
