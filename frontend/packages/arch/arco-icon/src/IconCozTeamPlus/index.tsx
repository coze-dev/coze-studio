import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozTeamPlusComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_team_plus${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M20.0001 7C20.0001 4.5145 17.9851 2.5 15.5001 2.5C13.0151 2.5 11.0001 4.5145 11.0001 7C11.0001 9.4855 13.0151 11.5 15.5001 11.5C17.9851 11.5 20.0001 9.4855 20.0001 7ZM15.5001 4.5C16.8801 4.5 18.0001 5.6195 18.0001 7C18.0001 8.3805 16.8801 9.5 15.5001 9.5C14.1201 9.5 13.0001 8.3805 13.0001 7C13.0001 5.6195 14.1201 4.5 15.5001 4.5Z"/><path d="M9.50013 19.5H12.9998C13.4559 20.1072 14.1821 20.5 15 20.5H16.5V21.5H9.50013C8.40013 21.5 7.50013 20.6 7.50013 19.5V17.9C7.50013 14.9175 9.89013 12.5 12.8351 12.5H16.9998C16.686 12.9178 16.5 13.4372 16.5 14V14.5H12.8351C11.0151 14.5 9.50013 15.9985 9.50013 17.9V19.5zM1.50013 20.5H5.63511V18.5H2.50011V17.9C2.50011 16.898 3.34511 16 4.50011 16H5.81011C6.00011 15.261 6.34011 14.583 6.79511 14H4.50011C2.29011 14 .500114 15.746.500114 17.9L.500127 19.5C.47534 20.0354.990738 20.5191 1.50013 20.5z"/><path fillRule="evenodd" clipRule="evenodd" d="M6.50013 6.5C8.15513 6.5 9.50013 7.843 9.50013 9.5C9.50013 11.157 8.15513 12.5 6.50013 12.5C4.84513 12.5 3.50013 11.157 3.50013 9.5C3.50013 7.843 4.84513 6.5 6.50013 6.5ZM7.50013 9.5C7.50013 8.9475 7.05013 8.5 6.50013 8.5C5.95013 8.5 5.50013 8.9475 5.50013 9.5C5.50013 10.0525 5.95013 10.5 6.50013 10.5C7.05013 10.5 7.50013 10.0525 7.50013 9.5Z"/><path d="M19 13C19.5523 13 20 13.4477 20 14V17H23C23.5523 17 24 17.4477 24 18C24 18.5523 23.5523 19 23 19H20V22C20 22.5523 19.5523 23 19 23C18.4477 23 18 22.5523 18 22V19H15C14.4477 19 14 18.5523 14 18C14 17.4477 14.4477 17 15 17H18V14C18 13.4477 18.4477 13 19 13Z"/></svg>;
}

const IconCozTeamPlus = React.forwardRef(IconCozTeamPlusComponent);
export default IconCozTeamPlus;
