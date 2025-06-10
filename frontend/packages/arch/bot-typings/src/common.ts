/** bot详情页来源：目前只有bot和explore列表 */
export enum BotPageFromEnum {
  Bot = 'bot', //bot列表
  Explore = 'explore', //explore列表
  Store = 'store',
  Template = 'template',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 不得不 any
export type Obj = Record<string, any>;

/**
 * 展示完整类型
 *
 * @example
 * type Intersection = { a: string } & { b: number };
 * type Result = Expand<Intersection>;
 * // Result: { a: string; b: number }
 */
export type Expand<T extends Obj> = T extends infer U
  ? { [K in keyof U]: U[K] }
  : never;

/**
 * 只对特定字段做 required，常用于修正服务端类型声明错误
 *
 * @example
 * interface Agent {
 *  id?: string;
 *  name?: string;
 *  desc?: string
 * }
 * type Result = PartialRequired<Agent, 'id' | 'name'>;
 * // Result: {
 * //  id: string;
 * //  name: string;
 * //  desc?: string
 * // };
 */
export type PartialRequired<T extends Obj, K extends keyof T> = Expand<
  {
    [P in K]-?: T[P];
  } & Pick<T, Exclude<keyof T, K>>
>;
