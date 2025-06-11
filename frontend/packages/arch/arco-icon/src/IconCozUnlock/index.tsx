import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozUnlockComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_unlock${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M15 15C15 16.6569 13.6569 18 12 18C10.3431 18 9 16.6569 9 15C9 13.3431 10.3431 12 12 12C13.6569 12 15 13.3431 15 15ZM13 15C13 15.5523 12.5523 16 12 16C11.4477 16 11 15.5523 11 15C11 14.4477 11.4477 14 12 14C12.5523 14 13 14.4477 13 15Z"/><path fillRule="evenodd" clipRule="evenodd" d="M24 6.5C24 3.46243 21.5376 1 18.5 1C15.4624 1 13 3.46243 13 6.5V8H4C2.89543 8 2 8.89543 2 10V20C2 21.1046 2.89543 22 4 22H20C21.1046 22 22 21.1046 22 20V10C22 8.89543 21.1046 8 20 8H15V6.5C15 4.567 16.567 3 18.5 3C20.433 3 22 4.567 22 6.5V7C22 7.55228 22.4477 8 23 8C23.5523 8 24 7.55228 24 7V6.5ZM20 10H4V20H20V10Z"/></svg>;
}

const IconCozUnlock = React.forwardRef(IconCozUnlockComponent);
export default IconCozUnlock;
