import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozAspectRatio916Component(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_aspect_ratio_9_16${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path opacity=".2" d="M5.12793 1C4.73238 1.56697 4.5 2.25626 4.5 3H3V21H4.5C4.5 21.7437 4.73238 22.433 5.12793 23H3L2.7959 22.9893C1.85435 22.8938 1.1062 22.1457 1.01074 21.2041L1 21V3C1 1.96435 1.78722 1.113 2.7959 1.01074L3 1H5.12793ZM21.2041 1.01074C22.2128 1.113 23 1.96435 23 3V21L22.9893 21.2041C22.8938 22.1457 22.1457 22.8938 21.2041 22.9893L21 23H18.8721C19.2676 22.433 19.5 21.7437 19.5 21H21V3H19.5C19.5 2.25626 19.2676 1.56697 18.8721 1H21L21.2041 1.01074ZM6 3C6 2.93276 6.00315 2.86629 6.00977 2.80078L6.01074 2.7959L6 3Z"/><path d="M16 1C17.1046 1 18 1.89543 18 3V21C18 22.1046 17.1046 23 16 23H8L7.7959 22.9893C6.78722 22.887 6 22.0357 6 21V3C6 1.89543 6.89543 1 8 1H16ZM8 21H16V3H8V21Z"/></svg>;
}

const IconCozAspectRatio916 = React.forwardRef(IconCozAspectRatio916Component);
export default IconCozAspectRatio916;
