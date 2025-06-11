import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozArrowMiddleComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_arrow_middle${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M12.7071 10.1038C12.3166 10.4943 11.6834 10.4943 11.2929 10.1038L7.85063 6.66148C7.46011 6.27095 7.46011 5.63779 7.85063 5.24726 8.24116 4.85674 8.87432 4.85674 9.26485 5.24726L11 6.98244 11.0208 1.69897C11.0208 1.14669 11.4685.698975 12.0208.698975 12.5731.698975 13.0208 1.14669 13.0208 1.69897L13 6.98244 14.7352 5.24726C15.1257 4.85674 15.7589 4.85674 16.1494 5.24726 16.5399 5.63779 16.5399 6.27095 16.1494 6.66148L12.7071 10.1038zM11.2929 13.8945C11.6834 13.504 12.3166 13.504 12.7071 13.8945L16.1494 17.3368C16.5399 17.7273 16.5399 18.3605 16.1494 18.751 15.7588 19.1415 15.1257 19.1415 14.7352 18.751L13 17.0158 12.9792 22.2993C12.9792 22.8516 12.5315 23.2993 11.9792 23.2993 11.4269 23.2993 10.9792 22.8516 10.9792 22.2993L11 17.0158 9.26479 18.751C8.87427 19.1415 8.2411 19.1415 7.85058 18.751 7.46005 18.3605 7.46005 17.7273 7.85058 17.3368L11.2929 13.8945zM2 12.0001C2 11.4478 2.44772 11.0001 3 11.0001H21C21.5523 11.0001 22 11.4478 22 12.0001 22 12.5524 21.5523 13.0001 21 13.0001H3C2.44772 13.0001 2 12.5524 2 12.0001z"/></svg>;
}

const IconCozArrowMiddle = React.forwardRef(IconCozArrowMiddleComponent);
export default IconCozArrowMiddle;
