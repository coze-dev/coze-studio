import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozBorderBottomComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_border_bottom${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M22 4L22 15.6273C21.4331 15.2319 20.7436 15 20 15L20 4L4 4L4 15C3.25638 15 2.56692 15.2319 2 15.6273V4C2 2.89543 2.89543 2 4 2L20 2C21.1046 2 22 2.89543 22 4Z"/><path fillRule="evenodd" clipRule="evenodd" d="M4 22C2.89543 22 2 21.1046 2 20V18.5C2 17.3954 2.89543 16.5 4 16.5L20 16.5C21.1046 16.5 22 17.3954 22 18.5V20C22 21.1046 21.1046 22 20 22L4 22ZM4 20L4 18.5L20 18.5V20L4 20Z"/></svg>;
}

const IconCozBorderBottom = React.forwardRef(IconCozBorderBottomComponent);
export default IconCozBorderBottom;
