export const SUCCESSFUL_UPLOAD_PROGRESS = 100;

export const POLLING_TIME = 3000;

export const MAX_UNIT_NAME_LEN = 100;

export const BOT_DATA_REFACTOR_CLASS_NAME = 'data-refactor';

export const TABLE_ACCEPT_LOCAL_FILE = ['.xls', '.xlsx', '.csv'];

interface TextUploadChannelConfig {
  acceptFileTypes: string[];
  fileFormatString: string;
  addUnitMaxLimit: number;
}

export type Channel = 'DOUYIN' | 'DEFAULT';

const textUploadChannelConfigMap: Record<Channel, TextUploadChannelConfig> = {
  DOUYIN: {
    acceptFileTypes: ['.pdf', '.txt', '.doc', '.docx'],
    fileFormatString: 'PDF、TXT、DOC、DOCX',
    addUnitMaxLimit: 100,
  },
  DEFAULT: {
    acceptFileTypes: ['.pdf', '.txt', '.doc', '.docx', '.md'],
    fileFormatString: 'PDF、TXT、DOC、DOCX、MD',
    addUnitMaxLimit: 300,
  },
};

export const getTextUploadChannelConfig = (
  channel?: Channel,
): TextUploadChannelConfig =>
  (channel && textUploadChannelConfigMap[channel]) ||
  textUploadChannelConfigMap.DEFAULT;
