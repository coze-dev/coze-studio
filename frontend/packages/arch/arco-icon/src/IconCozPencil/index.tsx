import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozPencilComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_pencil${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M17.9516 3.22029C18.7652 2.4067 20.0579 2.38031 20.8389 3.16136 21.62 3.94241 21.5936 5.23512 20.78 6.04871L19.3069 7.52185 16.4784 4.69343 17.9516 3.22029zM15.0155 6.15632L17.844 8.98474 6.98584 19.8429C6.69566 20.1331 6.32565 20.3289 5.92758 20.4029L3.34511 20.8834C3.27133 20.8972 3.19691 20.8747 3.14528 20.8231 3.09299 20.7708 3.07063 20.6951 3.0854 20.6205L3.59458 18.0496C3.67052 17.6662 3.86135 17.3105 4.14136 17.0305L15.0155 6.15632z"/></svg>;
}

const IconCozPencil = React.forwardRef(IconCozPencilComponent);
export default IconCozPencil;
