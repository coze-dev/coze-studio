import { UserLevel, type MemberVersionRights } from '../types';

interface UseBenefitBasicResult {
  name: string; // 当前用户套餐名称
  level: UserLevel; // 当前工作空间：用户的套餐级别
  compareLevel: UserLevel; // 当前工作空间：如果是专业版，值是 UserLevel.ProPersonal，其他场景同 level
  currPlan: MemberVersionRights; // 当前套餐信息
  nextPlan: MemberVersionRights; // 下一个套餐信息。如果当前已经是最高套餐级别，则值为最高级别套餐
  accountPlan: MemberVersionRights; // 账号维度的套餐信息
  instanceStatus: unknown; // 当前套餐状态，可以用来判断退订/到期状态
  isOverdue: boolean; // 是否欠费
  isExpired: boolean; // 是否过期
  isTerminated: boolean; // 是否退订
  maxMember: number; //成员上限
}

const defaultData = {
  name: '',
  level: UserLevel.Free,
  compareLevel: UserLevel.Free,
  currPlan: {},
  nextPlan: {},
  accountPlan: {},
  instanceStatus: 1,
  isOverdue: false,
  isExpired: false,
  isTerminated: false,
  maxMember: -1,
};
/**
 * 获取国内权益基础信息
 */
export function useBenefitBasic(): UseBenefitBasicResult {
  return defaultData;
}
