import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozAdjustComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_adjust${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M18.874 7C18.4299 8.72523 16.8638 10 15 10 13.1362 10 11.5701 8.72523 11.126 7H3C2.44772 7 2 6.55228 2 6 2 5.44772 2.44772 5 3 5H11.126C11.5701 3.27477 13.1362 2 15 2 16.8638 2 18.4299 3.27477 18.874 5H21C21.5523 5 22 5.44772 22 6 22 6.55228 21.5523 7 21 7H18.874zM15 8C16.1046 8 17 7.10457 17 6 17 4.89543 16.1046 4 15 4 13.8954 4 13 4.89543 13 6 13 7.10457 13.8954 8 15 8zM12.874 19C12.4299 20.7252 10.8638 22 9 22 7.13616 22 5.57006 20.7252 5.12602 19H3C2.44772 19 2 18.5523 2 18 2 17.4477 2.44772 17 3 17H5.12602C5.57006 15.2748 7.13616 14 9 14 10.8638 14 12.4299 15.2748 12.874 17H21C21.5523 17 22 17.4477 22 18 22 18.5523 21.5523 19 21 19H12.874zM9 20C10.1046 20 11 19.1046 11 18 11 16.8954 10.1046 16 9 16 7.89543 16 7 16.8954 7 18 7 19.1046 7.89543 20 9 20z"/></svg>;
}

const IconCozAdjust = React.forwardRef(IconCozAdjustComponent);
export default IconCozAdjust;
