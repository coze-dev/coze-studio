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

import { describe, expect, it } from 'vitest';

import { getFileInfo } from '../src/util';
import { FileTypeEnum } from '../src/const';

// Create a simulated File object
function createMockFile(name: string, type: string): File {
  return {
    name,
    type,
    size: 1024,
    lastModified: Date.now(),
    slice: () => new Blob(),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    stream: () => new ReadableStream(),
    text: () => Promise.resolve(''),
  } as File;
}

describe('getFileInfo', () => {
  it('应该根据文件类型识别图片文件', () => {
    const file = createMockFile('test.jpg', 'image/jpeg');
    const fileInfo = getFileInfo(file);

    expect(fileInfo).not.toBeNull();
    expect(fileInfo?.fileType).toBe(FileTypeEnum.IMAGE);
  });

  it('应该根据文件类型识别音频文件', () => {
    const file = createMockFile('test.mp3', 'audio/mpeg');
    const fileInfo = getFileInfo(file);

    expect(fileInfo).not.toBeNull();
    expect(fileInfo?.fileType).toBe(FileTypeEnum.AUDIO);
  });

  it('应该根据文件类型识别视频文件', () => {
    const file = createMockFile('test.mp4', 'video/mp4');
    const fileInfo = getFileInfo(file);

    expect(fileInfo).not.toBeNull();
    expect(fileInfo?.fileType).toBe(FileTypeEnum.VIDEO);
  });

  it('应该根据文件扩展名识别 PDF 文件', () => {
    const file = createMockFile('document.pdf', 'application/pdf');
    const fileInfo = getFileInfo(file);

    expect(fileInfo).not.toBeNull();
    expect(fileInfo?.fileType).toBe(FileTypeEnum.PDF);
  });

  it('应该根据文件扩展名识别 DOCX 文件', () => {
    const file = createMockFile(
      'document.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    const fileInfo = getFileInfo(file);

    expect(fileInfo).not.toBeNull();
    expect(fileInfo?.fileType).toBe(FileTypeEnum.DOCX);
  });

  it('应该根据文件扩展名识别 EXCEL 文件', () => {
    const file = createMockFile(
      'spreadsheet.xlsx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    const fileInfo = getFileInfo(file);

    expect(fileInfo).not.toBeNull();
    expect(fileInfo?.fileType).toBe(FileTypeEnum.EXCEL);
  });

  it('应该根据文件扩展名识别 CSV 文件', () => {
    const file = createMockFile('data.csv', 'text/csv');
    const fileInfo = getFileInfo(file);

    expect(fileInfo).not.toBeNull();
    expect(fileInfo?.fileType).toBe(FileTypeEnum.CSV);
  });

  it('应该根据文件扩展名识别压缩文件', () => {
    const file = createMockFile('archive.zip', 'application/zip');
    const fileInfo = getFileInfo(file);

    expect(fileInfo).not.toBeNull();
    expect(fileInfo?.fileType).toBe(FileTypeEnum.ARCHIVE);
  });

  it('应该根据文件扩展名识别代码文件', () => {
    const file = createMockFile('script.js', 'text/javascript');
    const fileInfo = getFileInfo(file);

    expect(fileInfo).not.toBeNull();
    expect(fileInfo?.fileType).toBe(FileTypeEnum.CODE);
  });

  it('应该根据文件扩展名识别文本文件', () => {
    const file = createMockFile('notes.txt', 'text/plain');
    const fileInfo = getFileInfo(file);

    expect(fileInfo).not.toBeNull();
    expect(fileInfo?.fileType).toBe(FileTypeEnum.TXT);
  });

  it('应该根据文件扩展名识别 PPT 文件', () => {
    const file = createMockFile(
      'presentation.pptx',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    );
    const fileInfo = getFileInfo(file);

    expect(fileInfo).not.toBeNull();
    expect(fileInfo?.fileType).toBe(FileTypeEnum.PPT);
  });

  it('应该对未知文件类型返回默认类型', () => {
    const file = createMockFile('unknown.xyz', 'application/octet-stream');
    const fileInfo = getFileInfo(file);

    expect(fileInfo).not.toBeNull();
    expect(fileInfo?.fileType).toBe(FileTypeEnum.DEFAULT_UNKNOWN);
  });

  it('当文件类型和扩展名不匹配时，应该优先使用文件类型判断', () => {
    // The file name is .txt, but the MIME type is image
    const file = createMockFile('image.txt', 'image/jpeg');
    const fileInfo = getFileInfo(file);

    expect(fileInfo).not.toBeNull();
    expect(fileInfo?.fileType).toBe(FileTypeEnum.IMAGE);
  });

  it('当文件没有 MIME 类型时，应该使用扩展名判断', () => {
    const file = createMockFile('document.docx', '');
    const fileInfo = getFileInfo(file);

    expect(fileInfo).not.toBeNull();
    expect(fileInfo?.fileType).toBe(FileTypeEnum.DOCX);
  });
});
