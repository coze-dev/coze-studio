import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozEraserComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_eraser${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M8.82837 22L21 22C21.5523 22 22 21.5523 22 21C22 20.4477 21.5523 20 21 20H14.9999L22.0857 12.9142C22.8668 12.1332 22.8668 10.8668 22.0857 10.0858L15.4142 3.41422C14.6331 2.63317 13.3668 2.63317 12.5857 3.41422L2.41416 13.5858C1.63311 14.3668 1.63311 15.6332 2.41415 16.4142L7.41416 21.4142C7.78923 21.7893 8.29794 22 8.82837 22ZM6.70707 12.1213L13.3786 18.7929L12.1715 20H8.82837L3.82837 15L6.70707 12.1213ZM8.12128 10.7071L13.9999 4.82843L20.6715 11.5L14.7929 17.3787L8.12128 10.7071Z"/></svg>;
}

const IconCozEraser = React.forwardRef(IconCozEraserComponent);
export default IconCozEraser;
