import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozAspectRatio219Component(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_aspect_ratio_21_9${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path opacity=".2" d="M23 21L22.9893 21.2041C22.8938 22.1457 22.1457 22.8938 21.2041 22.9893L21 23H3L2.7959 22.9893C1.85435 22.8938 1.1062 22.1457 1.01074 21.2041L1 21V17.8711C1.56706 18.2668 2.25606 18.5 3 18.5V21H21V18.5C21.7439 18.5 22.4329 18.2668 23 17.8711V21ZM1 9C1 8.93276 1.00315 8.86629 1.00977 8.80078L1.01074 8.7959L1 9ZM21.2041 1.01074C22.2128 1.113 23 1.96435 23 3V6.12793C22.433 5.73238 21.7437 5.5 21 5.5V3H3V5.5C2.25626 5.5 1.56697 5.73238 1 6.12793V3C1 1.96435 1.78722 1.113 2.7959 1.01074L3 1H21L21.2041 1.01074Z"/><path d="M21 7C22.1046 7 23 7.89543 23 9V15C23 16.1046 22.1046 17 21 17H3L2.7959 16.9893C1.78722 16.887 1 16.0357 1 15V9C1 7.89543 1.89543 7 3 7H21ZM3 15H21V9H3V15Z"/></svg>;
}

const IconCozAspectRatio219 = React.forwardRef(IconCozAspectRatio219Component);
export default IconCozAspectRatio219;
