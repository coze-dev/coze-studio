import { memo } from 'react';

import { type ValueExpressionInputProps } from './value-expression-input';
import { TypedValueExpressionInput } from './typed-value-expression-input';

// eslint-disable-next-line @typescript-eslint/naming-convention
const ValueExpressionInput = memo(TypedValueExpressionInput);

export { ValueExpressionInput, type ValueExpressionInputProps };
