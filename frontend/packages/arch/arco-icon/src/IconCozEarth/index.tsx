import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozEarthComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_earth${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1ZM8.65909 3.6405C5.6385 4.84878 3.42561 7.64679 3.05493 11H7.019C7.0342 7.80001 8 5.00001 8.65909 3.6405ZM20.9451 11C20.5744 7.64679 18.3615 4.84878 15.3409 3.6405C16 5.00001 16.9658 8.20001 16.981 11H20.9451ZM12 3C10.5 3 9 7.5 9.02056 11H14.9794C15 7.5 13.5 3 12 3ZM15.3409 20.3595C18.3615 19.1512 20.5744 16.3532 20.9451 13L16.981 13C16.9658 16.2 16 19 15.3409 20.3595ZM3.05492 13C3.4256 16.3532 5.63849 19.1512 8.65909 20.3595C8 19 7.0342 15.8 7.019 13L3.05492 13ZM12 21C13.5 21 15 16.5 14.9794 13H9.02056C9 16.5 10.5 21 12 21Z"/></svg>;
}

const IconCozEarth = React.forwardRef(IconCozEarthComponent);
export default IconCozEarth;
