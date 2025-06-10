import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozBorderComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_border${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M5.5 5.5H18.5V18.5H5.5V5.5ZM7.5 7.5H16.5V16.5H7.5V7.5Z"/><path fillRule="evenodd" clipRule="evenodd" d="M2 5.5C2 3.567 3.567 2 5.5 2H18.5C20.433 2 22 3.567 22 5.5V18.5C22 20.433 20.433 22 18.5 22H5.5C3.567 22 2 20.433 2 18.5V5.5ZM5.5 4H18.5C19.3284 4 20 4.67157 20 5.5V18.5C20 19.3284 19.3284 20 18.5 20H5.5C4.67157 20 4 19.3284 4 18.5V5.5C4 4.67157 4.67157 4 5.5 4Z"/></svg>;
}

const IconCozBorder = React.forwardRef(IconCozBorderComponent);
export default IconCozBorder;
