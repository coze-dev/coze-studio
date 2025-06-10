import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozHouseFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_house_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M9.5 22C10.0523 22 10.5 21.5523 10.5 21V17C10.5 16.4477 10.9477 16 11.5 16H12.5C13.0523 16 13.5 16.4477 13.5 17V21C13.5 21.5523 13.9477 22 14.5 22H20C21.1046 22 22 21.1046 22 20V10C22 9.39243 21.7238 8.81781 21.2494 8.43826L13.2494 2.49954C12.519 1.91519 11.481 1.91519 10.7506 2.49954L2.75061 8.43826C2.27618 8.81781 2 9.39243 2 10V20C2 21.1046 2.89543 22 4 22H9.5Z"/></svg>;
}

const IconCozHouseFill = React.forwardRef(IconCozHouseFillComponent);
export default IconCozHouseFill;
