import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozDistributeHorizontalComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_distribute_horizontal${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M11.7334 1.33334C11.5125 1.33334 11.3334 1.51243 11.3334 1.73334V22.2667C11.3334 22.4876 11.5125 22.6667 11.7334 22.6667H12.9334C13.1543 22.6667 13.3334 22.4876 13.3334 22.2667V1.73334C13.3334 1.51243 13.1543 1.33334 12.9334 1.33334H11.7334zM3.06675 18.6667C2.84583 18.6667 2.66675 18.4876 2.66675 18.2667V5.73334C2.66675 5.51243 2.84583 5.33334 3.06675 5.33334H7.60008C7.82099 5.33334 8.00008 5.51243 8.00008 5.73334V18.2667C8.00008 18.4876 7.82099 18.6667 7.60008 18.6667H3.06675zM16.0001 5.73334C16.0001 5.51243 16.1792 5.33334 16.4001 5.33334H20.9334C21.1543 5.33334 21.3334 5.51243 21.3334 5.73334V18.2667C21.3334 18.4876 21.1543 18.6667 20.9334 18.6667H16.4001C16.1792 18.6667 16.0001 18.4876 16.0001 18.2667V5.73334z"/></svg>;
}

const IconCozDistributeHorizontal = React.forwardRef(IconCozDistributeHorizontalComponent);
export default IconCozDistributeHorizontal;
