import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozAnalyticsComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_analytics${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M8 10C8 9.44772 7.55228 9 7 9 6.44772 9 6 9.44772 6 10V16C6 16.5523 6.44772 17 7 17 7.55228 17 8 16.5523 8 16V10zM12 7C12.5523 7 13 7.44772 13 8V16C13 16.5523 12.5523 17 12 17 11.4477 17 11 16.5523 11 16V8C11 7.44772 11.4477 7 12 7zM18 12C18 11.4477 17.5523 11 17 11 16.4477 11 16 11.4477 16 12V16C16 16.5523 16.4477 17 17 17 17.5523 17 18 16.5523 18 16V12z"/><path fillRule="evenodd" clipRule="evenodd" d="M2 4C2 2.89543 2.89543 2 4 2H20C21.1046 2 22 2.89543 22 4V20C22 21.1046 21.1046 22 20 22H4C2.89543 22 2 21.1046 2 20V4ZM4 4H20V20H4V4Z"/></svg>;
}

const IconCozAnalytics = React.forwardRef(IconCozAnalyticsComponent);
export default IconCozAnalytics;
