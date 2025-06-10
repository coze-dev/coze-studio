import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozBannerComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_banner${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M5.5 15.5C4.94772 15.5 4.5 15.9477 4.5 16.5 4.5 17.0523 4.94772 17.5 5.5 17.5H11.5C12.0523 17.5 12.5 17.0523 12.5 16.5 12.5 15.9477 12.0523 15.5 11.5 15.5H5.5zM14 16.5C14 15.9477 14.4477 15.5 15 15.5 15.5523 15.5 16 15.9477 16 16.5 16 17.0523 15.5523 17.5 15 17.5 14.4477 17.5 14 17.0523 14 16.5zM18.5 15.5C17.9477 15.5 17.5 15.9477 17.5 16.5 17.5 17.0523 17.9477 17.5 18.5 17.5 19.0523 17.5 19.5 17.0523 19.5 16.5 19.5 15.9477 19.0523 15.5 18.5 15.5z"/><path fillRule="evenodd" clipRule="evenodd" d="M1 5C1 3.89543 1.89543 3 3 3H21C22.1046 3 23 3.89543 23 5V19C23 20.1046 22.1046 21 21 21H3C1.89543 21 1 20.1046 1 19V5ZM3 5H21V19H3V5Z"/></svg>;
}

const IconCozBanner = React.forwardRef(IconCozBannerComponent);
export default IconCozBanner;
