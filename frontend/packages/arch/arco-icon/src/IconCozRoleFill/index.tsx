import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozRoleFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_role_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M16.4901 4.96572C15.9183 2.83185 13.7249 1.56552 11.5911 2.13729L3.86367 4.20784C1.7298 4.77961 0.463471 6.97296 1.03524 9.10682L2.58815 14.9024C3.73169 19.1701 8.11838 21.7028 12.3861 20.5592C16.6538 19.4157 19.1865 15.029 18.043 10.7613L16.4901 4.96572ZM14.0496 13.3871C14.2248 12.7379 13.3718 12.5741 12.8893 13.0424C12.2979 13.6164 11.5562 14.052 10.7036 14.2804C9.85116 14.5088 8.99112 14.5026 8.19208 14.3012C7.54002 14.1369 6.88331 14.7053 7.35966 15.1799C8.33714 16.1539 9.79258 16.5951 11.2213 16.2123C12.6502 15.8294 13.6901 14.7195 14.0496 13.3871ZM6.65866 11.7411C7.32549 11.5625 7.72122 10.877 7.54255 10.2102C7.36387 9.54337 6.67845 9.14764 6.01161 9.32632C5.34478 9.505 4.94905 10.1904 5.12773 10.8573C5.30641 11.5241 5.99183 11.9198 6.65866 11.7411ZM13.8211 8.52788C13.9997 9.19471 13.604 9.88013 12.9372 10.0588C12.2703 10.2375 11.5849 9.84176 11.4062 9.17493C11.2276 8.50809 11.6233 7.82267 12.2901 7.644C12.957 7.46532 13.6424 7.86105 13.8211 8.52788Z"/><path d="M12.8815 22.0081C12.7194 22.0515 12.5573 22.0905 12.3951 22.1251C16.4061 22.7874 20.3424 20.3095 21.4166 16.3004L22.9695 10.5048C23.5413 8.37094 22.2749 6.1776 20.1411 5.60583L18.1809 5.08059L19.7267 10.8496C19.7276 10.8531 19.7255 10.8568 19.722 10.8577C19.7186 10.8586 19.7165 10.8621 19.7172 10.8656C20.76 15.7742 17.7853 20.6941 12.8815 22.0081Z"/></svg>;
}

const IconCozRoleFill = React.forwardRef(IconCozRoleFillComponent);
export default IconCozRoleFill;
