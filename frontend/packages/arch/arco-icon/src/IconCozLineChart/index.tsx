import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozLineChartComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_line_chart${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M4 4C4 3.44772 3.55228 3 3 3C2.44772 3 2 3.44772 2 4V19C2 20.1046 2.89543 21 4 21H21C21.5523 21 22 20.5523 22 20C22 19.4477 21.5523 19 21 19H4V4Z"/><path d="M21.2071 6.79289C20.8166 6.40237 20.1834 6.40237 19.7929 6.79289L15.5 11.0858L12.2071 7.79289C11.8166 7.40237 11.1834 7.40237 10.7929 7.79289L5.29289 13.2929C4.90237 13.6834 4.90237 14.3166 5.29289 14.7071C5.68342 15.0976 6.31658 15.0976 6.70711 14.7071L11.5 9.91421L14.7929 13.2071C15.1834 13.5976 15.8166 13.5976 16.2071 13.2071L21.2071 8.20711C21.5976 7.81658 21.5976 7.18342 21.2071 6.79289Z"/></svg>;
}

const IconCozLineChart = React.forwardRef(IconCozLineChartComponent);
export default IconCozLineChart;
