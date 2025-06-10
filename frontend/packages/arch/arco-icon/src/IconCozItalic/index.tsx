import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozItalicComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_italic${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M14.8251 5.07692L11.1887 18.9231H15.2412C15.8147 18.9231 16.2797 19.388 16.2797 19.9615C16.2797 20.5351 15.8147 21 15.2412 21H4.95448C4.38095 21 3.91602 20.5351 3.91602 19.9615C3.91602 19.388 4.38095 18.9231 4.95448 18.9231H9.00693L12.6433 5.07692H8.59084C8.01731 5.07692 7.55238 4.61199 7.55238 4.03846C7.55238 3.46494 8.01731 3 8.59084 3H18.8776C19.4511 3 19.916 3.46494 19.916 4.03846C19.916 4.61199 19.4511 5.07692 18.8776 5.07692H14.8251Z"/></svg>;
}

const IconCozItalic = React.forwardRef(IconCozItalicComponent);
export default IconCozItalic;
