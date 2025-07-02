// 对齐 card-builder 生成 ID 的逻辑，暂时拷贝一份，未来计划直接使用 card-buidler 的底层能力
import { nanoid, customAlphabet } from 'nanoid';

/**
 * @param prefix - id前缀
 * @param options - alphabet: 字母表; length: 长度，默认10;
 */
export const shortid = (
  prefix = '',
  options?: {
    alphabet?: string;
    length?: number;
  },
) => {
  const {
    alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    length = 10,
  } = options || {};
  const genId = customAlphabet(alphabet, length);
  return `${prefix}${genId()}`;
};

export const uuid = () => nanoid();

export const id = shortid;

export const generate = shortid;
