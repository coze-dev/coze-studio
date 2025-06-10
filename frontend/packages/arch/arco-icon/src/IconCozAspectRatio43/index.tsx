import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozAspectRatio43Component(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_aspect_ratio_4_3${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path opacity=".2" d="M23 21L22.9893 21.2041C22.8938 22.1457 22.1457 22.8938 21.2041 22.9893L21 23H3L2.7959 22.9893C1.85435 22.8938 1.1062 22.1457 1.01074 21.2041L1 21V20.8711C1.56706 21.2668 2.25606 21.5 3 21.5H21C21.7439 21.5 22.4329 21.2668 23 20.8711V21ZM1 6C1 5.93276 1.00315 5.86629 1.00977 5.80078L1.01074 5.7959L1 6ZM21.2041 1.01074C22.2128 1.113 23 1.96435 23 3V3.12793C22.433 2.73238 21.7437 2.5 21 2.5H3C2.25626 2.5 1.56697 2.73238 1 3.12793V3C1 1.96435 1.78722 1.113 2.7959 1.01074L3 1H21L21.2041 1.01074Z"/><path d="M21 4C22.1046 4 23 4.89543 23 6V18C23 19.1046 22.1046 20 21 20H3L2.7959 19.9893C1.78722 19.887 1 19.0357 1 18V6C1 4.89543 1.89543 4 3 4H21ZM3 18H21V6H3V18Z"/></svg>;
}

const IconCozAspectRatio43 = React.forwardRef(IconCozAspectRatio43Component);
export default IconCozAspectRatio43;
