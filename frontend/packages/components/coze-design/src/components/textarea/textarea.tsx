import { forwardRef } from 'react';

import { TextArea as SemiTextArea } from '@douyinfe/semi-ui';

import { cn } from '@/utils';

import { Loading } from '../loading';
import { textareaVariants, textareaWrapperVariants } from './textarea.variant';
import { type TextAreaProps } from './textarea.types';

import './index.css';

const defaultProps: TextAreaProps = {
  error: false,
  loading: false,
  disabled: false,
};

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (props, ref) => {
    const {
      wrapperClassName,
      className,
      disabled,
      error,
      suffix,
      prefix,
      loading,
      ...restProps
    } = {
      ...defaultProps,
      ...props,
    };

    const textareaClassName = cn(
      textareaVariants({ error, disabled: disabled || loading }),
      {
        ['coz-textarea-with-suffix']: suffix,
        ['coz-textarea-with-prefix']: loading,
      },
      className,
    );

    const renderPrefix = () => {
      if (!loading && !prefix) {
        return null;
      }
      return (
        <div className="coz-textarea-prefix">
          {prefix ? (
            prefix
          ) : loading ? (
            <Loading size="mini" loading={loading} />
          ) : null}
        </div>
      );
    };

    const renderSuffix = () => {
      if (!suffix) {
        return null;
      }
      return <div className="coz-textarea-suffix">{suffix}</div>;
    };

    return (
      <div className={cn(textareaWrapperVariants(), wrapperClassName)}>
        <SemiTextArea
          disabled={disabled || loading}
          className={textareaClassName}
          ref={ref}
          {...restProps}
        ></SemiTextArea>
        {renderPrefix()}
        {renderSuffix()}
      </div>
    );
  },
);

TextArea.displayName = 'TextArea';
