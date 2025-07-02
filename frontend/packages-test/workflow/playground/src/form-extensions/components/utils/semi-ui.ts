import { type FormItemFeedback } from '@flowgram-adapter/free-layout-editor';

export const feedbackStatus2ValidateStatus = (
  feedbackStatus: FormItemFeedback['feedbackStatus'],
) => {
  switch (feedbackStatus) {
    case 'error':
      return 'error';
    case 'warning':
      return 'warning';
    default:
      return undefined;
  }
};
