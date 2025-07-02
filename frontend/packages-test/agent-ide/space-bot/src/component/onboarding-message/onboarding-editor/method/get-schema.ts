import { displayType } from '@coze-common/md-editor-adapter';

export const getSchema = () => ({
  image: {
    display: displayType.inline,
    displayEnter: false,
  },
});
