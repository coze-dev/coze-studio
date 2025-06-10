import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozBorderTopComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_border_top${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M20 2C21.1046 2 22 2.89543 22 4V5.5C22 6.60457 21.1046 7.5 20 7.5L4 7.5C2.89543 7.5 2 6.60457 2 5.5V4C2 2.89543 2.89543 2 4 2H20ZM20 4V5.5L4 5.5V4L20 4Z"/><path d="M2 20V8.37265C2.56692 8.76809 3.25638 8.99999 4 8.99999L4 20H20V9C20.7436 9 21.4331 8.76809 22 8.37265V20C22 21.1046 21.1046 22 20 22H4C2.89543 22 2 21.1046 2 20Z"/></svg>;
}

const IconCozBorderTop = React.forwardRef(IconCozBorderTopComponent);
export default IconCozBorderTop;
