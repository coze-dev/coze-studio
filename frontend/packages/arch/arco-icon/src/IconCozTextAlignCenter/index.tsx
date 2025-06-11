import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozTextAlignCenterComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_text_align_center${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M2 4C2 3.44772 2.44772 3 3 3H21C21.5523 3 22 3.44772 22 4 22 4.55228 21.5523 5 21 5H3C2.44772 5 2 4.55228 2 4zM2 20C2 19.4477 2.44772 19 3 19H21C21.5523 19 22 19.4477 22 20 22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20zM8 11C7.44772 11 7 11.4477 7 12 7 12.5523 7.44772 13 8 13H16C16.5523 13 17 12.5523 17 12 17 11.4477 16.5523 11 16 11H8z"/></svg>;
}

const IconCozTextAlignCenter = React.forwardRef(IconCozTextAlignCenterComponent);
export default IconCozTextAlignCenter;
