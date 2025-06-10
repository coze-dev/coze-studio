import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozTriangleComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_triangle${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M19.9556 18.9429L12 5.05714L4.04444 18.9429H19.9556ZM13.7679 4.02857C12.9822 2.65714 11.0178 2.65714 10.2321 4.02857L2.27654 17.9143C1.49081 19.2857 2.47297 21 4.04444 21H19.9556C21.527 21 22.5092 19.2857 21.7235 17.9143L13.7679 4.02857Z"/></svg>;
}

const IconCozTriangle = React.forwardRef(IconCozTriangleComponent);
export default IconCozTriangle;
