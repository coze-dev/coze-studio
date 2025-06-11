import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozBachelorCapFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_bachelor_cap_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M19.5 11.5708V18.5182C19.5 20.9271 15.0159 22.5503 12 22.5503C8.98405 22.5503 4.5 20.9271 4.5 18.5182V11.4L10.8562 14.7451C11.5722 15.1121 12.421 15.1121 13.1369 14.7451L19.5 11.5708Z"/><path d="M0.867636 7.14389C0.505058 7.32973 0.505059 7.84796 0.867637 8.0338L1.00033 8.10181V13.8789C1.00033 14.4312 1.44805 14.8789 2.00033 14.8789C2.55262 14.8789 3.00033 14.4312 3.00033 13.8789V9.12693L11.7714 13.6226C11.9146 13.696 12.0844 13.696 12.2276 13.6226L23.1314 8.0338C23.4939 7.84796 23.4939 7.32973 23.1314 7.14389L12.2276 1.55504C12.0844 1.48165 11.9146 1.48165 11.7714 1.55504L0.867636 7.14389Z"/></svg>;
}

const IconCozBachelorCapFill = React.forwardRef(IconCozBachelorCapFillComponent);
export default IconCozBachelorCapFill;
