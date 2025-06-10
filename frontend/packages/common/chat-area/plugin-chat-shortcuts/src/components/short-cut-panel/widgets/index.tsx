import { DSLFormUpload } from './upload';
import { type DSLComponent } from './types';
import { DSLFormInput } from './text-input';
import { DSLSubmitButton } from './submit-button';
import { DSLFormSelect } from './select';
import { DSLRoot } from './root';
import { DSLPlaceholer } from './placeholder';
import { DSLColumnLayout } from './layout';
import { DSLForm } from './form';

// 组件参数是在运行时决定，无法具体做类型约束
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DSLWidgetsMap: Record<string, DSLComponent<any>> = {
  '@flowpd/cici-components/Input': DSLFormInput,
  '@flowpd/cici-components/Select': DSLFormSelect,
  '@flowpd/cici-components/Upload': DSLFormUpload,
  '@flowpd/cici-components/Placeholder': DSLPlaceholer,
  '@flowpd/cici-components/ColumnLayout': DSLColumnLayout,
  '@flowpd/cici-components/Form': DSLForm,
  '@flowpd/cici-components/PageContainer': DSLRoot,
  '@flowpd/cici-components/Button': DSLSubmitButton,
} as const;
