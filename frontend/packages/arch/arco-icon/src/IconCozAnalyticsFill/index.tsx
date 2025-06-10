import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozAnalyticsFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_analytics_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M4 2C2.89543 2 2 2.89543 2 4V20C2 21.1046 2.89543 22 4 22H20C21.1046 22 22 21.1046 22 20V4C22 2.89543 21.1046 2 20 2H4ZM8.2 10C8.2 9.33726 7.66274 8.8 7 8.8C6.33726 8.8 5.8 9.33726 5.8 10V16C5.8 16.6627 6.33726 17.2 7 17.2C7.66274 17.2 8.2 16.6627 8.2 16V10ZM12 6.8C12.6627 6.8 13.2 7.33726 13.2 8V16C13.2 16.6627 12.6627 17.2 12 17.2C11.3373 17.2 10.8 16.6627 10.8 16V8C10.8 7.33726 11.3373 6.8 12 6.8ZM18.2 12C18.2 11.3373 17.6627 10.8 17 10.8C16.3373 10.8 15.8 11.3373 15.8 12V16C15.8 16.6627 16.3373 17.2 17 17.2C17.6627 17.2 18.2 16.6627 18.2 16V12Z"/></svg>;
}

const IconCozAnalyticsFill = React.forwardRef(IconCozAnalyticsFillComponent);
export default IconCozAnalyticsFill;
