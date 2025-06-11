import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozArrowDobbleLeftComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_arrow_dobble_left${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M17.8284 4.22181L10.7573 11.2929C10.3668 11.6834 10.3668 12.3166 10.7573 12.7071L17.8284 19.7782C18.2189 20.1687 18.8521 20.1687 19.2426 19.7782C19.6332 19.3876 19.6332 18.7545 19.2426 18.3639L12.8787 12L19.2426 5.63602C19.6332 5.2455 19.6332 4.61234 19.2426 4.22181C18.8521 3.83129 18.2189 3.83129 17.8284 4.22181Z"/><path d="M10.8284 4.22179L3.75737 11.2929C3.36685 11.6834 3.36685 12.3165 3.75737 12.7071L10.8284 19.7781C11.219 20.1687 11.8521 20.1687 12.2427 19.7781C12.6332 19.3876 12.6332 18.7544 12.2427 18.3639L5.87869 12L12.2427 5.636C12.6332 5.24548 12.6332 4.61231 12.2427 4.22179C11.8521 3.83126 11.219 3.83126 10.8284 4.22179Z"/></svg>;
}

const IconCozArrowDobbleLeft = React.forwardRef(IconCozArrowDobbleLeftComponent);
export default IconCozArrowDobbleLeft;
