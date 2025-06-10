import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozCoffeeFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_coffee_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M5 2.00037C4.44771 2.00037 4 2.44808 4 3.00036V5.00037C4 5.55265 4.44771 6.00037 5 6.00037C5.55228 6.00037 6 5.55265 6 5.00037V3.00036C6 2.44808 5.55228 2.00037 5 2.00037Z"/><path fillRule="evenodd" clipRule="evenodd" d="M1.50328 7.00061C1.22371 7.00061 0.99707 7.22725 0.99707 7.50682V14.0006C0.997143 16.1223 1.94535 18.157 3.6331 19.6572C5.32093 21.1575 7.61011 22.0004 9.99705 22.0004C12.384 22.0004 14.6732 21.1575 16.361 19.6572C17.7814 18.3946 18.678 16.7534 18.9265 15.0005C18.9503 15.0009 18.9741 15.0011 18.998 15.0011C21.2071 15.0011 22.998 13.2102 22.998 11.0011C22.998 8.79196 21.2062 7.00061 18.997 7.00061H1.50328ZM20.998 11.0011C20.998 12.1057 20.1016 13.0011 18.997 13.0011L18.998 9.0011C20.1026 9.0011 20.998 9.89653 20.998 11.0011Z"/><path d="M9 3.00036C9 2.44808 9.44771 2.00037 10 2.00037 10.5523 2.00037 11 2.44808 11 3.00036V5.00037C11 5.55265 10.5523 6.00037 10 6.00037 9.44771 6.00037 9 5.55265 9 5.00037V3.00036zM15 2.00037C14.4477 2.00037 14 2.44808 14 3.00036V5.00037C14 5.55265 14.4477 6.00037 15 6.00037 15.5523 6.00037 16 5.55265 16 5.00037V3.00036C16 2.44808 15.5523 2.00037 15 2.00037z"/></svg>;
}

const IconCozCoffeeFill = React.forwardRef(IconCozCoffeeFillComponent);
export default IconCozCoffeeFill;
