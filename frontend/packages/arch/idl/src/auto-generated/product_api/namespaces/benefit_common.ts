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

export enum AccountStatus {
  Available = 1,
  /** 账户付费不可用 */
  Unavailable = 2,
}

/** 权益流水状态 */
export enum BenefitCostStatus {
  /** 已撤回 */
  Reverted = 0,
  /** 已成功 */
  Succeed = 1,
}

/** Benefit 所作用的实体类型 */
export enum BenefitEntityType {
  /** 企业下的所有设备 */
  EnterpriseAllDevices = 1,
  /** 企业下的所有终端 */
  EnterpriseAllCustomConsumer = 2,
  /** 单设备 */
  EnterpriseSingleDevice = 11,
  /** 单终端主题，由客户自定义 */
  EnterpriseSingleCustomConsumer = 12,
  /** API */
  API = 13,
  /** Plugin */
  Plugin = 14,
  /** Voice */
  Voice = 15,
  /** Workflow */
  Workflow = 16,
  /** 火山语音通话实例 */
  VolcVoiceDurationInstance = 17,
  /** CozeUserID */
  CozeUserID = 18,
  /** CozeRole */
  CozeRole = 19,
  /** LongTermMemory */
  LongTermMemory = 20,
  /** 企业配置类
企业安心用配置 */
  EnterpriseConfConfidenceUsing = 51,
}

export enum BenefitExtensionApplyStatus {
  /** 申请中 */
  Auditing = 1,
  /** 已通过 */
  Approved = 2,
  /** 已拒绝 */
  Rejected = 3,
  /** 已过期 */
  Expired = 4,
  /** 已取消 */
  Canceled = 5,
}

/** 权益历史记录类型 */
export enum BenefitHistoryType {
  /** bot 消耗 */
  ChatWithBot = 1,
  TopUpCredit = 2,
  BounsCredit = 3,
  ChargeBack = 4,
  ChargeBackReverse = 5,
  WorkflowConsume = 6,
  /** 智能语音 */
  IntelligentVoice = 11,
  /** 扣子罗盘消耗 */
  Fornax = 12,
  EvaluateConsume = 41,
  EvaluateModelConsume = 42,
  /** 应用消耗 */
  ProjectConsume = 61,
}

/** 权益流水根节点类型 */
export enum BenefitRootHistoryType {
  /** bot 消耗 */
  BotConsume = 1,
  /** workflow 消耗 */
  WorkflowConsume = 2,
  /** 应用消耗 */
  ProjectConsume = 3,
  /** 智能语音 */
  IntelligentVoiceConsume = 4,
  /** 扣子罗盘消耗 */
  FornaxConsume = 5,
  /** 模型评测消耗 */
  EvaluateModelConsume = 6,
  /** 长期记忆 */
  LongTermMemoryConsume = 7,
  /** 插件消耗 */
  PluginConsume = 8,
}

/** 权益类型
 40 -59 免费次数
 60 - 99 限流
 100-109 资源点
 110-129 Fornax
 130-149 WorkSpace
 150-169 运维
 170-179 知识库
 180-199 语音
 200-219 租户相关
 220-229 发布相关 */
export enum BenefitType {
  /** 海外 */
  MessageCredit = 1,
  UserFreeChat = 2,
  TopUpMessageCredit = 3,
  BonusMessageCredit = 4,
  /** 40 -59 免费次数 */
  Freetimes = 40,
  /** 评测免费次数 */
  EvaluateFree = 41,
  /** Workflow 测试运行免费次数 */
  WorkflowTestRunFree = 42,
  /** App 测试运行免费次数 */
  AppTestRunFree = 43,
  /** Plugin 测试运行免费次数 */
  PluginRunFree = 44,
  /** API 运行免费次数 */
  APIRunFree = 45,
  /** SDK 运行免费次数 */
  SDKRunFree = 46,
  /** 60 - 99 限流
模型 RPM 限流 */
  RateLimitModelRPM = 60,
  /** 模型 Input TPM 限流 */
  RateLimitModelInputTPM = 61,
  /** 模型 Output TPM 限流 */
  RateLimitModelOutputTPM = 62,
  /** 基础模型 Input TPM 限流 */
  RateLimitModelInputTPMBasic = 63,
  /** 基础模型 Output TPM 限流 */
  RateLimitModelOutputTPMBasic = 64,
  /** Plugin 运行 QPS 限流 */
  PluginRunQPS = 65,
  /** Plugin 运行并发度限流 */
  PluginRunParallel = 66,
  /** 图像节点
Workflow 运行 QPS 限流 */
  WorkflowRunQPS = 67,
  /** Workflow 运行并发度限流 */
  WorkflowRunParallel = 68,
  /** API 运行 QPS 限流 */
  APIRunQPS = 70,
  /** 语音 QPS 限流 */
  VoiceQPS = 71,
  /** 语音并发度限流 */
  VoiceParallel = 72,
  /** 调用 tool 次数限流 */
  CallToolLimit = 73,
  /** 100-109 资源点
资源点总量 */
  ResourcePoint = 100,
  /** 免费资源点，废弃 */
  FreeResourcePoint = 101,
  /** 火山购买的资源点 */
  VolcProResourcePoint = 102,
  /** 周期性资源点 */
  PeriodicResourcePoint = 103,
  /** 渠道递减资源点 */
  ChannelResourcePoint = 104,
  /** 试算资源点 */
  CutAndTryResourcePoint = 109,
  /** 110-129 Fornax
Trace 用量 */
  TraceAmount = 111,
  /** Trace 存储时长 */
  TraceStorageDuration = 112,
  /** 130-149 WorkSpace
Space 总量 */
  SpaceAmount = 131,
  /** Space 人数 */
  SpacePeopleNumber = 132,
  /** Space 下协作者人数 */
  SpaceCollaboratorNumber = 133,
  /** 150-169 运维
日志存储时长 */
  LogStorageDuration = 151,
  /** 日志导出 */
  LogExport = 152,
  /** 170-179 知识库
知识库容量 */
  Capacity = 170,
  /** 180-199 语音
音色克隆总数 */
  VoiceCloneNumber = 180,
  /** 音色克隆基础数量 */
  VoiceCloneNumberBasic = 181,
  /** 语音统一时长（系统音色） */
  VoiceUnifiedDurationSystem = 182,
  /** 语音统一时长（复刻音色） */
  VoiceUnifiedDurationCustom = 183,
  /** 200-219 租户相关
席位数上限 */
  SeatNumberLimit = 200,
  /** 基础席位数 */
  SeatNumberBasic = 201,
  /** 扩展席位数 */
  SeatNumberExtension = 202,
  /** 移除水印 */
  RemoveWatermark = 220,
  /** 240-269 配置
安心用 */
  ConfidenceUsing = 240,
  /** 270-300 实体对用户是否可用
插件是否可用 */
  PluginAvailable = 270,
  /** 301-310 记忆库
单记忆库存储的记忆条数上限 */
  LongTermMemoryNum = 301,
  /** 500
计费资源提示信息 */
  ResourcePromptInfo = 500,
}

/** 权益使用模式 */
export enum BenefitUseMode {
  /** 按额度使用 */
  ByQuota = 1,
  /** 无限使用 */
  Unlimited = 2,
  /** 不可用 */
  UnAvailable = 10,
}

export enum BotMode {
  SingleMode = 0,
  MutiAgent = 1,
  WorkflowMode = 2,
}

export enum ChargeItemCostType {
  /** 资源点抵扣 */
  ResourcePoint = 0,
  /** 人民币抵扣 */
  CNY = 1,
}

export enum ChargeItemStatus {
  /** 启用 */
  Valid = 1,
  /** 停用 */
  Invalid = 2,
}

export enum ChargeItemType {
  /** 1-99 模型相关 */
  ModelInputTPM = 1,
  ModelOutputTPM = 2,
  /** 100-199 语音相关 */
  VoiceClone = 100,
  VoiceStorage = 101,
  /** 200- */
  PluginRunQPS = 200,
  PluginRunParallel = 201,
}

export enum ChargeResourceEntityType {
  Model = 1,
  Plugin = 2,
  Voice = 3,
  RTC = 4,
  BotRequest = 5,
  Knowledge = 6,
  Seat = 7,
  ModelTPM = 8,
  WorkSpace = 9,
  LongTermMemory = 10,
}

/** Type为BotRequest(5)的子类型SubType */
export enum ChargeResourceSubTypeBotRequest {
  /** 智能体调用 */
  AgentInvocation = 1,
}

/** Type为Knowledge(6)的子类型SubType */
export enum ChargeResourceSubTypeKnowledge {
  /** 容量 */
  Capacity = 1,
}

/** Type为LongTermMemory(10)的子类型SubType */
export enum ChargeResourceSubTypeLongTermMemory {
  /** 说明：记忆库运行时计费 */
  Running = 1,
  /** 说明：记忆库存储时计费 */
  Storage = 2,
}

/** Type为Model(1)的子类型SubType */
export enum ChargeResourceSubTypeModel {
  /** 输入 */
  Input = 1,
  /** 输出 */
  Output = 2,
}

/** Type为ModelTPM(8)的子类型SubType */
export enum ChargeResourceSubTypeModelTPM {
  /** 输入 */
  Input = 1,
  /** 输出 */
  Output = 2,
}

/** Type为Plugin(2)的子类型SubType */
export enum ChargeResourceSubTypePlugin {
  /** 自有插件 */
  SelfOwned = 1,
  /** 自有插件扩展包 */
  SelfOwnedExpansionPackage = 2,
  /** 三方插件 */
  ThirdPartyPlugin = 3,
  /** 万有三方插件 */
  WanYouThirdPartyPlugin = 4,
  /** coze 自营插件【二方插件】 */
  CozeSecondPartyPlugin = 5,
}

/** Type为RTC(4)的子类型SubType */
export enum ChargeResourceSubTypeRTC {
  /** 实时音视频 */
  RealTimeAudioVideo = 1,
}

/** Type为Seat(7)的子类型SubType */
export enum ChargeResourceSubTypeSeat {
  /** 成员数量 */
  MemberCnt = 1,
}

/** Type为Voice(3)的子类型SubType */
export enum ChargeResourceSubTypeVoice {
  /** 声音复刻 */
  VoiceCloning = 1,
  /** 语音合成 */
  SpeechSynthesis = 2,
  /** 语音识别 */
  SpeechRecognition = 3,
  /** 声纹识别 */
  VoiceprintRecognition = 4,
}

/** Type为WorkSpace(9)的子类型SubType */
export enum ChargeResourceSubTypeWorkSpace {
  /** 数量 */
  Quantity = 1,
  /** 人数 */
  PeopleNum = 2,
}

export enum ChargeResourceType {
  Model = 1,
  Plugin = 2,
}

/** 校验结果。通常结合BenefitType */
export enum CheckResultType {
  Pass = 1,
  /** 超出限额 */
  OutOfLimitation = 2,
  /** 余额/余量不足 */
  InsufficientBalance = 3,
}

/** 权益校验点位 */
export enum CheckType {
  /** 仅校验用于权益余量 */
  CheckCommon = 0,
  /** 对话（含Chatflow）开始。 */
  ChatStart = 1,
  /** 对话（含Chatflow）结束。对话结束后，上报对应对话结果 ErrCode */
  ChatFinish = 2,
  /** 调用模型前（通常为chat_engine/runtime），通常做限流 */
  ModelCallBefore = 6,
  /** 模型执行完成（model_agent/llm_gateway），通常用量上报 */
  ModelExecDone = 7,
  /** workflow执行。通常为非对话接口的workflow的执行前校验，如试用次数 */
  WorkflowRunStart = 11,
  /** workflow执行。通常为非对话接口的workflow执行后 */
  WorkflowRunFinish = 12,
  /** workflow中断重入 */
  WorkflowRunResume = 13,
  /** 调用插件前，通常做限流 */
  PluginCallBefore = 16,
  /** 插件执行完成。通常为插件用量上报 */
  PluginExecFinish = 17,
  /** 评测前（Fornax评测复用） */
  EvaluateBefore = 41,
  /** 评测结果裁判 */
  EvaluateJudge = 42,
  /** 语音消费结束时上报 */
  VoiceUseFinish = 51,
  /** 语音统一时长消耗上报 */
  VoiceUnifiedUseFinish = 52,
  /** Trace日志落库前，用于限额 */
  FornaxTraceBefore = 61,
  /** 知识库调用前 */
  MemoryLibraryCallBefore = 71,
  /** 知识库执行完成 */
  MemoryLibraryExecFinish = 72,
}

/** 权益流水对应消耗的资源类型 */
export enum ConsumeResourceType {
  /** 未知 */
  Unknown = 0,
  /** 模型 */
  Model = 1,
  /** 插件 */
  Plugin = 2,
  /** 语音（ASR/TTS） */
  Voice = 3,
  /** RTC */
  RTC = 4,
  /** 知识库（暂不对外暴露该类型） */
  Dateset = 5,
  /** 长期记忆 */
  LongTermMemory = 6,
}

export enum CostBalanceType {
  Free = 1,
  ResourcePoint = 2,
  VoiceUnifiedDurationSystem = 3,
  VoiceUnifiedDurationCustom = 4,
  CNY = 5,
}

/** 权益流水的成本归属用户类型 */
export enum CostUserType {
  /** 未知 */
  Unknown = 0,
  /** 企业（国内为火山账号） */
  Enterprise = 1,
  /** 个人用户 */
  User = 2,
}

export enum CozeAccountType {
  /** 未知 */
  Unknown = 0,
  /** 组织账号 */
  Organization = 1,
  /** 个人账号 */
  Personal = 2,
}

/** 用户权益套餐状态 */
export enum CozeInstanceStaus {
  /** 运行中 */
  Running = 1,
  /** 退订 */
  Unsubs = 2,
  /** 到期 */
  Expired = 3,
  /** 欠费 */
  Overdue = 4,
}

export enum DurationType {
  Day = 1,
  Month = 2,
  Year = 3,
}

export enum EntityBenefitStatus {
  /** 正常使用 */
  Valid = 1,
  /** 冻结使用 */
  Frozen = 3,
  /** 取消 */
  Cancel = 5,
  /** 待生效（此枚举通过计算得出，数据库中并无此项数据） */
  Pending = 6,
  /** 不可用 */
  Invalid = 8,
  /** 审核中 */
  Auditing = 9,
}

export enum EntityPeriodType {
  /** 绝对时间 */
  AbsoluteTime = 1,
  /** 相对时间 */
  RelativeTime = 2,
}

export enum ExecutionMode {
  /** 发布态/正式态 */
  Release = 0,
  /** 草稿态/调试态/编辑态。 */
  Draft = 1,
}

export enum ExtensionAuditorType {
  /** 官方 */
  Official = 1,
  /** 资源所有者 */
  ResourceOwner = 2,
}

export enum InstanceLimitStatus {
  /** 未受限 */
  UnLimited = 1,
  /** 受限中（欠费） */
  Limited = 2,
}

export enum InstanceStatus {
  /** 创建中, 理论上不会返回该状态 */
  InstanceStatusCreating = 0,
  /** 运行中 */
  Running = 1,
  /** 创建失败, 理论上不会返回该状态 */
  InstanceStatusFailed = 2,
  /** 退订回收 */
  UnsubsRecycled = 3,
  /** 到期关停 */
  ExpiredClosed = 4,
  /** 到期回收 */
  ExpiredRecycled = 5,
  /** 欠费关停 */
  InstanceStatusOverdueShutdown = 6,
  /** 欠费回收 */
  InstanceStatusOverdueRecycled = 7,
  /** 退订关停 */
  InstanceStatusTerminatedShutdown = 8,
}

export enum LimitationTriggerUnit {
  Never = 0,
  Minute = 1,
  Hour = 2,
  Day = 3,
  Month = 4,
  Second = 5,
}

export enum LongTermMemoryType {
  BuildVolcanoMemory = 1,
  FetchVolcanoMemory = 2,
}

/** 用量维度标识（当前用于分账） */
export enum MeasureDimensionType {
  Workspace = 1,
  Organization = 2,
}

export enum MonetizationEntityType {
  Bot = 0,
  Project = 1,
}

/** 权益流水的权益类型（用于对客） */
export enum OpenBenefitType {
  /** 未知 */
  Unknown = 0,
  /** 免费赠送（大类，包括插件试用次数等。对于国内，当前仅个人免费版有该类型） */
  Free = 1,
  /** 资源点 */
  ResourcePoint = 2,
  /** 语音统一时长（系统音色） */
  VoiceUnifiedDurationSystem = 3,
  /** 语音统一时长（复刻音色） */
  VoiceUnifiedDurationCustom = 4,
}

export enum OperateType {
  AddBenefit = 1,
  RefundSubscription = 2,
  RefundTopUp = 3,
  SubscriptionChargeBack = 4,
  TopUpChargeBack = 5,
  SubscriptionChargeBackReverse = 6,
  TopUpChargeBackReverse = 7,
}

export enum PluginBillType {
  /** 按次调用计费。适用于大多数插件 */
  ByCallTime = 0,
  /** 按时长计费（单位S）。适用于音乐生成、视频编辑等 */
  ByDuration = 1,
  /** 按token数计费。适用于视频生成 */
  ByTotalTokens = 2,
  /** 按输入输出token数计费。适用于播客插件 */
  ByInputOutputTokens = 3,
  /** 按通用用量计费。适用于单类用量上报 */
  ByCommCounter = 4,
  /** 插件本身不计费，由下游计费。 */
  NoneButByDownstream = 11,
}

/** 资源归属的实体类型 */
export enum ResBelongsToEntityType {
  /** 未知 */
  Unknown = 0,
  /** bot */
  Bot = 1,
  /** workflow */
  Workflow = 2,
  /** plugin */
  Plugin = 3,
  /** 应用。原Project */
  Application = 4,
  /** 模型 */
  Model = 5,
  /** 语音类（ASR/TTS） */
  Voice = 6,
}

export enum ResourcePackageInstanceStatus {
  /** 正常使用 */
  Valid = 1,
  /** 已过期 */
  Expired = 2,
  /** 未生效 */
  Invalid = 3,
  /** 已退款 */
  Refunded = 4,
  /** 已回收 */
  Recycled = 5,
}

export enum ResourceUsageStrategy {
  /** 无限制 */
  UnLimit = 1,
  /** 限制 */
  Forbidden = 2,
  /** 通过额度校验 */
  ByQuota = 3,
}

/** 场景 */
export enum SceneType {
  /** 对话 */
  Chat = 1,
  /** workflow testrun */
  WorkflowTest = 2,
  /** 评测bot */
  EvaluateBot = 41,
  /** 评测模型 */
  EvaluateModel = 42,
}

export enum UserLevel {
  /** 免费版。 */
  Free = 0,
  /** 海外
PremiumLite */
  PremiumLite = 10,
  /** Premium */
  Premium = 15,
  PremiumPlus = 20,
  /** 国内
V1火山专业版 */
  V1ProInstance = 100,
  /** 个人旗舰版 */
  ProPersonal = 110,
  /** 团队版 */
  Team = 120,
  /** 企业版 */
  Enterprise = 130,
}

export enum VoiceResType {
  /** 音色克隆 */
  VoiceClone = 1,
  /** 复刻语音-文字转语音 */
  TTSCustom = 2,
  /** 系统语音-文字转语音 */
  TTSSystem = 3,
  /** 流式语音识别 - 大模型 */
  ASRStream = 4,
  /** 录音文件语音识别 - 大模型 */
  ASRFile = 5,
  /** 流式语音识别 - 小模型 */
  ASRStreamSmall = 6,
  /** 录音文件语音识别 - 小模型 */
  ASRFileSmall = 7,
  /** 语音通话 音频时长 */
  RTCVoice = 8,
  /** 对话式AI 音频时长 */
  RTCDialogAI = 9,
  /** 视频通话时长-4k */
  RTCVideoCall4K = 10,
  /** 视频通话时长-2k */
  RTCVideoCall2K = 11,
  /** 视频通话时长-1080P */
  RTCVideoCall1080P = 12,
  /** 视频通话时长-720P */
  RTCVideoCall720P = 13,
  /** 视频通话时长-360P */
  RTCVideoCall360P = 14,
  /** TTS 相关计费项 【20-40)
文字转语音，按调用次数收费 - 小模型 */
  TTSSmall = 20,
  /** 语音能力（声纹）计费项
声纹能力 */
  VoicePrint = 60,
  /** 语音统一时长（系统音色） */
  VoiceUnifiedDurationSystem = 61,
  /** 语音统一时长（复刻音色） */
  VoiceUnifiedDurationCustom = 62,
}

export enum VolcanoUserType {
  Unknown = 0,
  RootUser = 1,
  BasicUser = 2,
}

export enum VolcInstanceType {
  /** 正常版本 */
  Normal = 1,
  /** 渠道版本 */
  Channel = 2,
}

export enum WorkflowMode {
  Unknown = 0,
  TestRun = 1,
  Released = 2,
}
/* eslint-enable */
