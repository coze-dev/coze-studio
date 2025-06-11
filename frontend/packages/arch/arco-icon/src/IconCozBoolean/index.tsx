import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozBooleanComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_boolean${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><g clipPath="url(#svg_6fe9197f47__clip0_420_4888)"><path fillRule="evenodd" clipRule="evenodd" d="M12 18.9297C10.8233 19.6104 9.45715 20 8 20C3.58172 20 0 16.4183 0 12C0 7.58172 3.58172 4 8 4C9.65685 4 11.1961 4.50368 12.4729 5.36627C12.319 5.2623 12.1613 5.16355 12 5.07026C13.1767 4.38958 14.5429 4 16 4C20.4183 4 24 7.58172 24 12C24 16.4183 20.4183 20 16 20C14.5429 20 13.1767 19.6104 12 18.9297ZM2 12C2 8.68629 4.68629 6 8 6C11.3137 6 14 8.68629 14 12C14 15.3137 11.3137 18 8 18C4.68629 18 2 15.3137 2 12Z"/></g><defs><clipPath id="svg_6fe9197f47__clip0_420_4888"><path d="M0 0H24V24H0z"/></clipPath></defs></svg>;
}

const IconCozBoolean = React.forwardRef(IconCozBooleanComponent);
export default IconCozBoolean;
