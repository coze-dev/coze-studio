import { connect, mapProps } from '@formily/react';
import { VoiceSelect as VoiceSelectBase } from '@coze-workflow/components';

const VoiceSelectAdapter = props => <VoiceSelectBase {...props} />;

export const VoiceSelect = connect(
  VoiceSelectAdapter,
  mapProps({ validateStatus: true }),
);
