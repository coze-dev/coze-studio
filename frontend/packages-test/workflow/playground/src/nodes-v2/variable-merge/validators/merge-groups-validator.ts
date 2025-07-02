import { type Validate } from '@flowgram-adapter/free-layout-editor';

import { MAX_GROUP_COUNT } from '../constants';

export const mergeGroupsValidator: Validate = ({ value }) => {
  const { length } = value || [];
  if (length === 0) {
    return 'merge groups should not be empty';
  }

  if (length > MAX_GROUP_COUNT) {
    return `merge groups should not be more than ${MAX_GROUP_COUNT}`;
  }
};
