import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozAspectRatio34Component(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_aspect_ratio_3_4${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path opacity=".2" d="M3.12793 1C2.73238 1.56697 2.5 2.25626 2.5 3V21C2.5 21.7437 2.73238 22.433 3.12793 23H3L2.7959 22.9893C1.85435 22.8938 1.1062 22.1457 1.01074 21.2041L1 21V3C1 1.96435 1.78722 1.113 2.7959 1.01074L3 1H3.12793ZM21.2041 1.01074C22.2128 1.113 23 1.96435 23 3V21L22.9893 21.2041C22.8938 22.1457 22.1457 22.8938 21.2041 22.9893L21 23H20.8721C21.2676 22.433 21.5 21.7437 21.5 21V3C21.5 2.25626 21.2676 1.56697 20.8721 1H21L21.2041 1.01074ZM4 3C4 2.93276 4.00315 2.86629 4.00977 2.80078L4.01074 2.7959L4 3Z"/><path d="M18 1C19.1046 1 20 1.89543 20 3V21C20 22.1046 19.1046 23 18 23H6C4.89543 23 4 22.1046 4 21V3C4 1.89543 4.89543 1 6 1H18ZM6 21H18V3H6V21Z"/></svg>;
}

const IconCozAspectRatio34 = React.forwardRef(IconCozAspectRatio34Component);
export default IconCozAspectRatio34;
