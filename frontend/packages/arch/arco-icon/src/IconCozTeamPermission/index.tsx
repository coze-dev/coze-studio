import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozTeamPermissionComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_team_permission${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M20.0001 7C20.0001 4.5145 17.9851 2.5 15.5001 2.5C13.0151 2.5 11.0001 4.5145 11.0001 7C11.0001 9.4855 13.0151 11.5 15.5001 11.5C17.9851 11.5 20.0001 9.4855 20.0001 7ZM15.5001 4.5C16.8801 4.5 18.0001 5.6195 18.0001 7C18.0001 8.3805 16.8801 9.5 15.5001 9.5C14.1201 9.5 13.0001 8.3805 13.0001 7C13.0001 5.6195 14.1201 4.5 15.5001 4.5Z"/><path d="M18.1651 14.5C19.0885 14.5 19.9334 14.8857 20.5417 15.5141L21.1821 14.8737C21.4571 14.5987 21.7802 14.4011 22.1244 14.2811 21.1479 13.1873 19.7354 12.5 18.1651 12.5H12.8351C9.89013 12.5 7.50013 14.9175 7.50013 17.9V19.5C7.50013 20.6 8.40013 21.5 9.50013 21.5H14.3734L13.404 20.5306C13.1056 20.2322 12.8984 19.8771 12.7824 19.5H9.50013V17.9C9.50013 15.9985 11.0151 14.5 12.8351 14.5H18.1651zM1.50013 20.5H5.63511V18.5H2.50011V17.9C2.50011 16.898 3.34511 16 4.50011 16H5.81011C6.00011 15.261 6.34011 14.583 6.79511 14H4.50011C2.29011 14 .500114 15.746.500114 17.9L.500127 19.5C.47534 20.0354.990738 20.5191 1.50013 20.5z"/><path fillRule="evenodd" clipRule="evenodd" d="M6.50013 6.5C8.15513 6.5 9.50013 7.843 9.50013 9.5C9.50013 11.157 8.15513 12.5 6.50013 12.5C4.84513 12.5 3.50013 11.157 3.50013 9.5C3.50013 7.843 4.84513 6.5 6.50013 6.5ZM7.50013 9.5C7.50013 8.9475 7.05013 8.5 6.50013 8.5C5.95013 8.5 5.50013 8.9475 5.50013 9.5C5.50013 10.0525 5.95013 10.5 6.50013 10.5C7.05013 10.5 7.50013 10.0525 7.50013 9.5Z"/><path d="M23.6568 15.9345C24.0473 16.325 24.0473 16.9582 23.6568 17.3487L18.7162 22.2893L18.7072 22.2985C18.4669 22.5387 18.1348 22.6312 17.8238 22.5758C17.6293 22.5412 17.4431 22.4487 17.2929 22.2985L17.2852 22.2908L14.4645 19.47C14.074 19.0795 14.074 18.4464 14.4645 18.0558C14.855 17.6653 15.4882 17.6653 15.8787 18.0558L18 20.1771L22.2426 15.9345C22.6331 15.544 23.2663 15.544 23.6568 15.9345Z"/></svg>;
}

const IconCozTeamPermission = React.forwardRef(IconCozTeamPermissionComponent);
export default IconCozTeamPermission;
