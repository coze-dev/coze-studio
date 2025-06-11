import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozAspectRatio169Component(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_aspect_ratio_16_9${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path opacity=".2" d="M23 21L22.9893 21.2041C22.8938 22.1457 22.1457 22.8938 21.2041 22.9893L21 23H3L2.7959 22.9893C1.85435 22.8938 1.1062 22.1457 1.01074 21.2041L1 21V18.8711C1.56706 19.2668 2.25606 19.5 3 19.5V21H21V19.5C21.7439 19.5 22.4329 19.2668 23 18.8711V21ZM1 8C1 7.93276 1.00315 7.86629 1.00977 7.80078L1.01074 7.7959L1 8ZM21.2041 1.01074C22.2128 1.113 23 1.96435 23 3V5.12793C22.433 4.73238 21.7437 4.5 21 4.5V3H3V4.5C2.25626 4.5 1.56697 4.73238 1 5.12793V3C1 1.96435 1.78722 1.113 2.7959 1.01074L3 1H21L21.2041 1.01074Z"/><path d="M21 6C22.1046 6 23 6.89543 23 8V16C23 17.1046 22.1046 18 21 18H3L2.7959 17.9893C1.78722 17.887 1 17.0357 1 16V8C1 6.89543 1.89543 6 3 6H21ZM3 16H21V8H3V16Z"/></svg>;
}

const IconCozAspectRatio169 = React.forwardRef(IconCozAspectRatio169Component);
export default IconCozAspectRatio169;
