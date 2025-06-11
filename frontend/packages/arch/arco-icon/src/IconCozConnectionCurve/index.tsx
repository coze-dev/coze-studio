import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozConnectionCurveComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_connection_curve${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M11.9701 8.24254C12.4466 6.33687 14.1588 5 16.1231 5H19C19.5523 5 20 4.55228 20 4C20 3.44772 19.5523 3 19 3H16.1231C13.2411 3 10.7289 4.96147 10.0299 7.75746C9.55344 9.66313 7.8412 11 5.87689 11H4C3.44772 11 3 11.4477 3 12C3 12.5523 3.44772 13 4 13H5.87689C7.8412 13 9.55344 14.3369 10.0299 16.2425C10.7289 19.0385 13.2411 21 16.1231 21H19C19.5523 21 20 20.5523 20 20C20 19.4477 19.5523 19 19 19H16.1231C14.1588 19 12.4466 17.6631 11.9701 15.7575C11.572 14.1647 10.5854 12.8428 9.27726 12C10.5854 11.1572 11.572 9.83526 11.9701 8.24254Z"/></svg>;
}

const IconCozConnectionCurve = React.forwardRef(IconCozConnectionCurveComponent);
export default IconCozConnectionCurve;
