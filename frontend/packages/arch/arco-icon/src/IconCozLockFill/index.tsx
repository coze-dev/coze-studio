import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozLockFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_lock_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M12 16C12.5523 16 13 15.5523 13 15C13 14.4477 12.5523 14 12 14C11.4477 14 11 14.4477 11 15C11 15.5523 11.4477 16 12 16Z"/><path fillRule="evenodd" clipRule="evenodd" d="M6.52242 8C6.50758 7.83532 6.5 7.66854 6.5 7.5C6.5 4.46243 8.96243 2 12 2C15.0376 2 17.5 4.46243 17.5 7.5C17.5 7.66854 17.4924 7.83532 17.4776 8H20C21.1046 8 22 8.89543 22 10V20C22 21.1046 21.1046 22 20 22H4C2.89543 22 2 21.1046 2 20V10C2 8.89543 2.89543 8 4 8H6.52242ZM15.5 7.5C15.5 7.66976 15.4879 7.8367 15.4646 8H8.53544C8.51209 7.8367 8.5 7.66976 8.5 7.5C8.5 5.567 10.067 4 12 4C13.933 4 15.5 5.567 15.5 7.5ZM12 18C13.6569 18 15 16.6569 15 15C15 13.3431 13.6569 12 12 12C10.3431 12 9 13.3431 9 15C9 16.6569 10.3431 18 12 18Z"/></svg>;
}

const IconCozLockFill = React.forwardRef(IconCozLockFillComponent);
export default IconCozLockFill;
