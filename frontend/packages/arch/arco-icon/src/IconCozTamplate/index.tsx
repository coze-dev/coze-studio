import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozTamplateComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_tamplate${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M6.5 13.5C6.5 13.2239 6.72386 13 7 13H10.5C10.7761 13 11 13.2239 11 13.5V17C11 17.2761 10.7761 17.5 10.5 17.5H7C6.72386 17.5 6.5 17.2761 6.5 17V13.5zM13.5 13C13.2239 13 13 13.2239 13 13.5V17C13 17.2761 13.2239 17.5 13.5 17.5H17C17.2761 17.5 17.5 17.2761 17.5 17V13.5C17.5 13.2239 17.2761 13 17 13H13.5zM6.5 7C6.5 6.72386 6.72386 6.5 7 6.5H10.5C10.7761 6.5 11 6.72386 11 7V10.5C11 10.7761 10.7761 11 10.5 11H7C6.72386 11 6.5 10.7761 6.5 10.5V7zM13.5 6.5C13.2239 6.5 13 6.72386 13 7V10.5C13 10.7761 13.2239 11 13.5 11H17C17.2761 11 17.5 10.7761 17.5 10.5V7C17.5 6.72386 17.2761 6.5 17 6.5H13.5z"/><path d="M4 2C2.89543 2 2 2.89543 2 4V20C2 21.1046 2.89543 22 4 22H20C21.1046 22 22 21.1046 22 20V4C22 2.89543 21.1046 2 20 2H4ZM20 4V20H4V4H20Z"/></svg>;
}

const IconCozTamplate = React.forwardRef(IconCozTamplateComponent);
export default IconCozTamplate;
