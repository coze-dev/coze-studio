import { it, expect } from 'vitest';

import { getFileExtensionAndName } from '../../src/utils/file-name';

it('should get file extension by xxx.extension case', () => {
  const fileName = '《史蒂夫·乔布斯传》官方正式中文版电子书.pdf';
  const { nameWithoutExtension, extension } = getFileExtensionAndName(fileName);
  expect(extension).toBe('.pdf');
  expect(nameWithoutExtension).toBe('《史蒂夫·乔布斯传》官方正式中文版电子书');
});

it('not get file extension by xxx case', () => {
  const fileName = 'Visual Studio Code';
  const { nameWithoutExtension, extension } = getFileExtensionAndName(fileName);
  expect(extension).toBe('');
  expect(nameWithoutExtension).toBe('Visual Studio Code');
});
