import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozBorderRightComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_border_right${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M4 2L15.6273 2C15.2319 2.56692 15 3.25638 15 4L4 4L4 20L15 20C15 20.7436 15.2319 21.4331 15.6273 22L4 22C2.89543 22 2 21.1046 2 20V4C2 2.89543 2.89543 2 4 2Z"/><path fillRule="evenodd" clipRule="evenodd" d="M22 20C22 21.1046 21.1046 22 20 22H18.5C17.3954 22 16.5 21.1046 16.5 20L16.5 4C16.5 2.89543 17.3954 2 18.5 2H20C21.1046 2 22 2.89543 22 4L22 20ZM20 20H18.5L18.5 4H20L20 20Z"/></svg>;
}

const IconCozBorderRight = React.forwardRef(IconCozBorderRightComponent);
export default IconCozBorderRight;
