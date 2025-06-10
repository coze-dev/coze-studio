import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozMinimizeComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_minimize${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M18.6485 9.41705H16.0483L20.5286 4.93675C20.9233 4.54201 20.9166 3.8978 20.5232 3.50182 20.1398 3.11603 19.5192 3.11765 19.1347 3.50222L14.6485 7.98837V5.41705C14.6485 4.86476 14.2008 4.41705 13.6485 4.41705 13.0962 4.41705 12.6485 4.86476 12.6485 5.41705V10.417C12.6485 10.6932 12.7605 10.9432 12.9414 11.1242 13.1224 11.3051 13.3724 11.417 13.6485 11.417H18.6485C19.2008 11.417 19.6485 10.9693 19.6485 10.417 19.6485 9.86476 19.2008 9.41705 18.6485 9.41705zM5.38009 14.5961H7.98035L3.50004 19.0764C3.10531 19.4712 3.11195 20.1154 3.50543 20.5113 3.88878 20.8971 4.50937 20.8955 4.89394 20.5109L9.38009 16.0248 9.38009 18.5961C9.38009 19.1484 9.82781 19.5961 10.3801 19.5961 10.9324 19.5961 11.3801 19.1484 11.3801 18.5961V13.5961C11.3801 13.32 11.2682 13.07 11.0872 12.889 10.9062 12.708 10.6562 12.5961 10.3801 12.5961L5.38009 12.5961C4.82781 12.5961 4.38009 13.0438 4.38009 13.5961 4.38009 14.1484 4.82781 14.5961 5.38009 14.5961z"/></svg>;
}

const IconCozMinimize = React.forwardRef(IconCozMinimizeComponent);
export default IconCozMinimize;
