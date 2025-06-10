import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozLockComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_lock${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M15 15C15 16.6569 13.6569 18 12 18C10.3431 18 9 16.6569 9 15C9 13.3431 10.3431 12 12 12C13.6569 12 15 13.3431 15 15ZM13 15C13 15.5523 12.5523 16 12 16C11.4477 16 11 15.5523 11 15C11 14.4477 11.4477 14 12 14C12.5523 14 13 14.4477 13 15Z"/><path fillRule="evenodd" clipRule="evenodd" d="M6.5 7.5C6.5 7.66854 6.50758 7.83532 6.52242 8H4C2.89543 8 2 8.89543 2 10V20C2 21.1046 2.89543 22 4 22H20C21.1046 22 22 21.1046 22 20V10C22 8.89543 21.1046 8 20 8H17.4776C17.4924 7.83532 17.5 7.66854 17.5 7.5C17.5 4.46243 15.0376 2 12 2C8.96243 2 6.5 4.46243 6.5 7.5ZM15.4646 8C15.4879 7.8367 15.5 7.66976 15.5 7.5C15.5 5.567 13.933 4 12 4C10.067 4 8.5 5.567 8.5 7.5C8.5 7.66976 8.51209 7.8367 8.53544 8H15.4646ZM4 10V20H20V10H4Z"/></svg>;
}

const IconCozLock = React.forwardRef(IconCozLockComponent);
export default IconCozLock;
