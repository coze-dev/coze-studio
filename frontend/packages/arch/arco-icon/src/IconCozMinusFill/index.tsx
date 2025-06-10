import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozMinusFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_minus_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 25 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M4.67688 13.5C4.1246 13.5 3.67688 13.0523 3.67688 12.5L3.67688 11.5C3.67688 10.9477 4.1246 10.5 4.67688 10.5L19.6769 10.5C20.2292 10.5 20.6769 10.9477 20.6769 11.5V12.5C20.6769 13.0523 20.2292 13.5 19.6769 13.5L4.67688 13.5Z"/></svg>;
}

const IconCozMinusFill = React.forwardRef(IconCozMinusFillComponent);
export default IconCozMinusFill;
