import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozTeamFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_team_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M8.49999 12C10.9853 12 13 9.98528 13 7.5 13 5.01472 10.9853 3 8.49999 3 6.01471 3 3.99999 5.01472 3.99999 7.5 3.99999 9.98528 6.01471 12 8.49999 12zM2.49997 22C1.39997 22 .499969 21.1.499969 20V19.0667C.499969 15.7161 3.31259 13 6.56816 13H10.4409C13.6965 13 16.5 15.7161 16.5 19.0667V20C16.5 21.1 15.6 22 14.5 22H2.49997zM18.5 21V20.7042C18.5 18.392 18.5 16 16.5 14.5 16.5837 14.4928 16.7241 14.4953 16.8591 14.4977 16.9245 14.4989 16.9886 14.5 17.0443 14.5H19C21.4417 14.5 23.5 16.0371 23.5 18.55V20C23.5 20.55 23.05 21 22.5 21H18.5zM17.5 13C19.1568 13 20.5 11.6569 20.5 10 20.5 8.34315 19.1568 7 17.5 7 15.8431 7 14.5 8.34315 14.5 10 14.5 11.6569 15.8431 13 17.5 13z"/></svg>;
}

const IconCozTeamFill = React.forwardRef(IconCozTeamFillComponent);
export default IconCozTeamFill;
