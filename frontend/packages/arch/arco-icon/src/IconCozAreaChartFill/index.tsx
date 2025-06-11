import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozAreaChartFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_area_chart_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M3 2C3.55228 2 4 2.44772 4 3V20H21C21.5523 20 22 20.4477 22 21C22 21.5523 21.5523 22 21 22H4C2.89543 22 2 21.1046 2 20V3C2 2.44772 2.44772 2 3 2Z"/><path d="M20.3827 4.07612C20.7563 4.2309 21 4.59554 21 5V17.5C21 18.0523 20.5523 18.5 20 18.5L5.5 18.5V11.5C5.5 11.2348 5.60536 10.9804 5.79289 10.7929L10.7929 5.79286C11.1834 5.40234 11.8166 5.40234 12.2071 5.79286L15 8.58576L19.2929 4.29289C19.5789 4.00689 20.009 3.92134 20.3827 4.07612Z"/></svg>;
}

const IconCozAreaChartFill = React.forwardRef(IconCozAreaChartFillComponent);
export default IconCozAreaChartFill;
