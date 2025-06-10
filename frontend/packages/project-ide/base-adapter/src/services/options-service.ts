/**
 * 插件配置
 */
import { type NavigateFunction } from 'react-router-dom';

export const OptionsService = Symbol('OptionsService');

export interface OptionsService {
  spaceId: string;
  projectId: string;
  version: string;
  navigate: NavigateFunction;
}
