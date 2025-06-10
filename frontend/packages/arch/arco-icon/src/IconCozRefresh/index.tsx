import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozRefreshComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_refresh${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M21 12.0001C21 16.9707 16.9705 21.0001 12 21.0001C7.02941 21.0001 2.99997 16.9707 2.99997 12.0001C2.99997 7.02956 7.02941 3.00012 12 3.00012C14.0234 3.00012 15.8894 3.6669 17.3926 4.79382L16.4563 6.21328C16.237 6.54574 16.4755 6.98865 16.8738 6.98858L21.4769 6.98785C21.8357 6.98779 22.0777 6.62097 21.9365 6.2911L20.1251 2.05933C19.9684 1.69319 19.4674 1.64832 19.2481 1.98078L18.4954 3.12185C16.6754 1.78832 14.4289 1.00012 12 1.00012C5.92484 1.00012 0.999969 5.92499 0.999969 12.0001C0.999969 18.0753 5.92484 23.0001 12 23.0001C18.0751 23.0001 23 18.0753 23 12.0001C23 11.4478 22.5523 11.0001 22 11.0001C21.4477 11.0001 21 11.4478 21 12.0001Z"/></svg>;
}

const IconCozRefresh = React.forwardRef(IconCozRefreshComponent);
export default IconCozRefresh;
