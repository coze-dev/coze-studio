import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozSuccessRateComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_success_rate${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M21 5H3L3 19H12.9984C13.1067 19.1899 13.2418 19.3687 13.4039 19.5307L14.8732 21H3C1.89543 21 1 20.1046 1 19V5C1 3.89543 1.89543 3 3 3H21C22.1046 3 23 3.89543 23 5V13.1421C22.3435 13.129 21.6829 13.3729 21.1819 13.8738L21 14.0558V5Z"/><path d="M7 8C6.44772 8 6 8.44772 6 9 6 9.55228 6.44771 10 7 10H16C16.5523 10 17 9.55228 17 9 17 8.44772 16.5523 8 16 8H7zM6 14C6 13.4477 6.44772 13 7 13H12C12.5523 13 13 13.4477 13 14 13 14.5523 12.5523 15 12 15H7C6.44772 15 6 14.5523 6 14zM23.6568 14.9345C24.0473 15.325 24.0473 15.9582 23.6568 16.3487L18.7162 21.2893 18.7072 21.2985C18.4669 21.5387 18.1348 21.6312 17.8238 21.5758 17.6293 21.5412 17.4431 21.4487 17.2929 21.2985L17.2852 21.2908 14.4645 18.47C14.074 18.0795 14.074 17.4464 14.4645 17.0558 14.855 16.6653 15.4882 16.6653 15.8787 17.0558L18 19.1771 22.2426 14.9345C22.6331 14.544 23.2663 14.544 23.6568 14.9345z"/></svg>;
}

const IconCozSuccessRate = React.forwardRef(IconCozSuccessRateComponent);
export default IconCozSuccessRate;
