import { customAlphabet } from 'nanoid';

const RANDOM_NUM = 6;
const RANDOM_ALPHABET = '0123456789';

export const randomNameSuffix = () => {
  const nanoid = customAlphabet(RANDOM_ALPHABET, RANDOM_NUM);
  return nanoid();
};
