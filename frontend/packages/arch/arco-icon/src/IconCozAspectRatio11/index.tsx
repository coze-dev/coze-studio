import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozAspectRatio11Component(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_aspect_ratio_1_1${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M20 2C21.1046 2 22 2.89543 22 4V20C22 21.1046 21.1046 22 20 22H4L3.7959 21.9893C2.78722 21.887 2 21.0357 2 20V4C2 2.89543 2.89543 2 4 2H20ZM4 20H20V4H4V20Z"/></svg>;
}

const IconCozAspectRatio11 = React.forwardRef(IconCozAspectRatio11Component);
export default IconCozAspectRatio11;
