import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozAreaChartComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_area_chart${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M4 3C4 2.44772 3.55228 2 3 2C2.44772 2 2 2.44772 2 3V20C2 21.1046 2.89543 22 4 22H21C21.5523 22 22 21.5523 22 21C22 20.4477 21.5523 20 21 20H4V3Z"/><path fillRule="evenodd" clipRule="evenodd" d="M21 5C21 4.59554 20.7563 4.2309 20.3827 4.07612C20.009 3.92134 19.5789 4.00689 19.2929 4.29289L15 8.58576L12.2071 5.79286C11.8166 5.40234 11.1834 5.40234 10.7929 5.79286L5.79289 10.7929C5.60536 10.9804 5.5 11.2348 5.5 11.5V18.5L20 18.5C20.5523 18.5 21 18.0523 21 17.5V5ZM15.7071 10.7071L19 7.41421V16.5L7.5 16.5V11.9142L11.5 7.91418L14.2929 10.7071C14.6834 11.0976 15.3166 11.0976 15.7071 10.7071Z"/></svg>;
}

const IconCozAreaChart = React.forwardRef(IconCozAreaChartComponent);
export default IconCozAreaChart;
