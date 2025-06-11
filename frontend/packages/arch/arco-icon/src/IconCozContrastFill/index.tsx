import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozContrastFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_contrast_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M11.9999 22C17.5227 22 21.9999 17.5228 21.9999 12C21.9999 6.47715 17.5227 2 11.9999 2C6.47703 2 1.99988 6.47715 1.99988 12C1.99988 17.5228 6.47703 22 11.9999 22ZM14.87 18.9291C13.9601 19.306 12.9848 19.5 11.9999 19.5V4.50002C12.9848 4.50001 13.9601 4.69401 14.87 5.07092C15.7799 5.44783 16.6067 6.00027 17.3032 6.69671C17.9996 7.39315 18.5521 8.21995 18.929 9.12989C19.3059 10.0398 19.4999 11.0151 19.4999 12C19.4999 12.9849 19.3059 13.9602 18.929 14.8701C18.5521 15.7801 17.9996 16.6069 17.3032 17.3033C16.6067 17.9998 15.7799 18.5522 14.87 18.9291Z"/></svg>;
}

const IconCozContrastFill = React.forwardRef(IconCozContrastFillComponent);
export default IconCozContrastFill;
