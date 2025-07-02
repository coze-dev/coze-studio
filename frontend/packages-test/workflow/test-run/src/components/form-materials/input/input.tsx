import { connect, mapProps } from '@formily/react';
import { Input as InputCore } from '@coze-arch/coze-design';

const InputAdapter = props => <InputCore size="small" {...props} />;

export const Input = connect(InputAdapter, mapProps({ validateStatus: true }));
