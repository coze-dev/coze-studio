import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozBorderLeftComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_border_left${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M2 4C2 2.89543 2.89543 2 4 2H5.5C6.60457 2 7.5 2.89543 7.5 4V20C7.5 21.1046 6.60457 22 5.5 22H4C2.89543 22 2 21.1046 2 20V4ZM4 4H5.5V20H4V4Z"/><path d="M20 22H8.37266C8.76809 21.4331 9 20.7436 9 20H20V4L9 4C9 3.25638 8.76809 2.56692 8.37266 2H20C21.1046 2 22 2.89543 22 4V20C22 21.1046 21.1046 22 20 22Z"/></svg>;
}

const IconCozBorderLeft = React.forwardRef(IconCozBorderLeftComponent);
export default IconCozBorderLeft;
