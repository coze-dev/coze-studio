import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozHouseComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_house${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M20 10L12 4.06128L4 10L4 20H9V16.2C9 14.985 9.98497 14 11.2 14H12.8C14.015 14 15 14.985 15 16.2V20H20V10ZM11 21C11 21.5523 10.5523 22 10 22H4C2.89543 22 2 21.1046 2 20V10C2 9.39243 2.27618 8.81781 2.75061 8.43826L10.7506 2.49954C11.481 1.91519 12.519 1.91519 13.2494 2.49954L21.2494 8.43826C21.7238 8.81781 22 9.39243 22 10V20C22 21.1046 21.1046 22 20 22H14C13.4477 22 13 21.5523 13 21V16.2C13 16.0896 12.9105 16 12.8 16H11.2C11.0895 16 11 16.0896 11 16.2V21Z"/></svg>;
}

const IconCozHouse = React.forwardRef(IconCozHouseComponent);
export default IconCozHouse;
