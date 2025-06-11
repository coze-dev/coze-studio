import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozBuildingComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_building${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M6.5 9.99978C5.94772 9.99978 5.5 10.4475 5.5 10.9998 5.5 11.5521 5.94772 11.9998 6.5 11.9998H10C10.5523 11.9998 11 11.5521 11 10.9998 11 10.4475 10.5523 9.99978 10 9.99978H6.5zM5.5 15.9998C5.5 15.4475 5.94772 14.9998 6.5 14.9998H10C10.5523 14.9998 11 15.4475 11 15.9998 11 16.5521 10.5523 16.9998 10 16.9998H6.5C5.94772 16.9998 5.5 16.5521 5.5 15.9998z"/><path fillRule="evenodd" clipRule="evenodd" d="M2 7.70791C2 6.07229 2.9958 4.60146 4.51444 3.994L10.3858 1.64545C12.3564.857209 14.5 2.30848 14.5 4.43088V21.9998H4C2.89543 21.9998 2 21.1043 2 19.9998V7.70791zM5.25722 5.85096L11.1286 3.5024C11.7855 3.23965 12.5 3.72341 12.5 4.43088V19.9998H4L4 7.70791C4 6.8901 4.4979 6.15468 5.25722 5.85096zM16 9.00001L19.5385 10.4744C21.029 11.0954 22 12.5519 22 14.1667V20C22 21.1046 21.1046 22 20 22H16V9.00001zM18 20V12L18.7692 12.3205C19.5145 12.6311 20 13.3593 20 14.1667V20H18z"/></svg>;
}

const IconCozBuilding = React.forwardRef(IconCozBuildingComponent);
export default IconCozBuilding;
