import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozArrowDownwardComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_arrow_downward${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M6.99999 8.5L6.99999 18.1213L4.46477 15.5861C4.07425 15.1956 3.4411 15.1956 3.05058 15.5861C2.66006 15.9766 2.66006 16.6098 3.05058 17.0003L7.29288 21.2426C7.48814 21.4379 7.74407 21.5355 7.99999 21.5355C8.25591 21.5355 8.51183 21.4379 8.70709 21.2426L12.9526 16.9965C13.3414 16.6077 13.3414 15.9774 12.9526 15.5886C12.5644 15.2005 11.9354 15.1997 11.5463 15.587L8.99999 18.1213L8.99999 8.73484C8.99999 6.80184 10.9807 3.73484 14 3.73484C17.0193 3.73484 19.0199 6.80184 19.0199 8.73484V20.5C19.0199 21.0468 19.4631 21.49 20.0099 21.49C20.5567 21.49 20.9999 21.0468 20.9999 20.5V8.5C20.9999 4.63401 17.866 1.5 14 1.5C10.134 1.5 6.99999 4.63401 6.99999 8.5Z"/></svg>;
}

const IconCozArrowDownward = React.forwardRef(IconCozArrowDownwardComponent);
export default IconCozArrowDownward;
