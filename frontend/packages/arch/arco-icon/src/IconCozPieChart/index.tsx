import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozPieChartComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_pie_chart${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM13 11H19.9381C19.4869 7.38128 16.6187 4.51314 13 4.06189V11ZM11 4.06189C7.05369 4.55399 4 7.92038 4 12C4 16.0796 7.05369 19.446 11 19.9381V4.06189ZM13 13V19.9381C16.6187 19.4869 19.4869 16.6187 19.9381 13H13Z"/></svg>;
}

const IconCozPieChart = React.forwardRef(IconCozPieChartComponent);
export default IconCozPieChart;
