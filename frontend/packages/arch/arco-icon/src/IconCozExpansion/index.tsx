import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozExpansionComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_expansion${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M2 4.5C2 3.94772 2.44772 3.5 3 3.5H21C21.5523 3.5 22 3.94772 22 4.5 22 5.05228 21.5523 5.5 21 5.5H3C2.44772 5.5 2 5.05228 2 4.5zM17.7574 12.7571L21.2929 16.2926C21.6834 16.6832 21.6834 17.3163 21.2929 17.7069L17.7574 21.2424C17.3668 21.6329 16.7337 21.6329 16.3431 21.2424 15.9526 20.8519 15.9526 20.2187 16.3431 19.8282L19.1716 16.9998 16.3431 14.1713C15.9526 13.7808 15.9526 13.1476 16.3431 12.7571 16.7337 12.3666 17.3668 12.3666 17.7574 12.7571zM3 8.5C2.44772 8.5 2 8.94772 2 9.5 2 10.0523 2.44772 10.5 3 10.5H21C21.5523 10.5 22 10.0523 22 9.5 22 8.94772 21.5523 8.5 21 8.5H3zM2 14.5C2 13.9477 2.44772 13.5 3 13.5H13C13.5523 13.5 14 13.9477 14 14.5 14 15.0523 13.5523 15.5 13 15.5H3C2.44772 15.5 2 15.0523 2 14.5zM3 18.5C2.44772 18.5 2 18.9477 2 19.5 2 20.0523 2.44772 20.5 3 20.5H13C13.5523 20.5 14 20.0523 14 19.5 14 18.9477 13.5523 18.5 13 18.5H3z"/></svg>;
}

const IconCozExpansion = React.forwardRef(IconCozExpansionComponent);
export default IconCozExpansion;
