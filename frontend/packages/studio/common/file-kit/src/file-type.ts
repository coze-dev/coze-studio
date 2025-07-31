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

import { FileTypeEnum, type TFileTypeConfig } from './const';

/**
 * file type
 * {@link
 * {@link https://www.iana.org/assignments/media-types/media-types.xhtml#image}
 */
export const FILE_TYPE_CONFIG: readonly TFileTypeConfig[] = [
  {
    fileType: FileTypeEnum.IMAGE,
    accept: ['image/*'],
    judge: file => file.type.startsWith('image/'),
  },
  {
    fileType: FileTypeEnum.AUDIO,
    accept: [
      '.mp3',
      '.wav',
      '.aac',
      '.flac',
      '.ogg',
      '.wma',
      '.alac',
      // Both .midi and .mid are extensions for MIDI (Musical Instrument Digital Interface) files - GPT
      '.mid',
      '.midi',
      '.ac3',
      '.dsd',
    ],
    judge: file => file.type.startsWith('audio/'),
  },
  {
    fileType: FileTypeEnum.PDF,
    accept: ['.pdf'],
  },
  {
    fileType: FileTypeEnum.DOCX,
    accept: ['.docx', '.doc'],
  },
  {
    fileType: FileTypeEnum.EXCEL,
    accept: ['.xls', '.xlsx'],
  },
  {
    fileType: FileTypeEnum.CSV,
    accept: ['.csv'],
  },
  {
    fileType: FileTypeEnum.VIDEO,
    accept: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv'],
    judge: file => file.type.startsWith('video/'),
  },
  {
    fileType: FileTypeEnum.ARCHIVE,
    accept: ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'],
  },
  {
    fileType: FileTypeEnum.CODE,
    accept: ['.py', '.java', '.c', '.cpp', '.js', '.html', '.css'],
  },
  {
    fileType: FileTypeEnum.TXT,
    accept: ['.txt'],
  },
  {
    fileType: FileTypeEnum.PPT,
    accept: ['.ppt', '.pptx'],
  },
  {
    fileType: FileTypeEnum.DEFAULT_UNKNOWN,
    judge: () => true,
    accept: ['*'],
  },
];
