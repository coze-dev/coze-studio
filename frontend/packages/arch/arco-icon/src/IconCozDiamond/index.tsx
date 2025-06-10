import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozDiamondComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_diamond${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M8.00001 8.38351C7.44772 8.38351 7.00001 8.83123 7.00001 9.38351C7.00001 9.9358 7.44772 10.3835 8.00001 10.3835H16C16.5523 10.3835 17 9.9358 17 9.38351C17 8.83123 16.5523 8.38351 16 8.38351H8.00001Z"/><path fillRule="evenodd" clipRule="evenodd" d="M5.66159 2.36911C5.30347 2.36911 4.97268 2.56061 4.79437 2.87118L1.17234 9.17951C0.962267 9.54539 1.00442 10.0038 1.2777 10.3252L11.2382 22.0407C11.4282 22.2641 11.7068 22.3929 12.0001 22.3929C12.2934 22.3929 12.5719 22.2641 12.7619 22.0407L22.7225 10.3252C22.9957 10.0038 23.0379 9.54539 22.8278 9.17951L19.2058 2.87118C19.0275 2.56061 18.6967 2.36911 18.3386 2.36911H5.66159ZM3.25695 9.56549L6.24053 4.36911H17.7596L20.7432 9.56549L12.0001 19.8491L3.25695 9.56549Z"/></svg>;
}

const IconCozDiamond = React.forwardRef(IconCozDiamondComponent);
export default IconCozDiamond;
