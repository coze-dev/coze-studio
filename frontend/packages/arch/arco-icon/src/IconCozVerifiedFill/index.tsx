import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozVerifiedFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_verified_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M19.5 12.4985C20.6045 12.4985 21.5 13.3939 21.5 14.4985V14.6043C21.3885 14.6838 21.282 14.7736 21.1819 14.8737L18 18.0557 16.9394 16.9951C15.9631 16.0187 14.3802 16.0187 13.4039 16.9951 12.983 17.4159 12.7436 17.9494 12.6856 18.4985H3.50003C2.94775 18.4985 2.50004 18.0508 2.50003 17.4985L2.5 14.4985C2.49999 13.3939 3.39542 12.4985 4.5 12.4985H7.68013C8.10575 12.4985 8.48473 12.2291 8.6246 11.8271L9.74683 8.60169C9.89017 8.26397 9.79246 7.87853 9.51615 7.63727 8.72225 6.94398 8.21795 5.92978 8.21795 4.79276 8.21795 2.43098 10.3766.573507 12.8287 1.08549 14.2586 1.384 15.4149 2.53906 15.7165 3.96837 16.0215 5.4122 15.5022 6.74836 14.5449 7.60802 14.2768 7.84886 14.1866 8.22891 14.3272 8.56061L15.4637 11.8271C15.6036 12.2291 15.9826 12.4985 16.4082 12.4985H19.5zM13.4039 20.5306C13.2419 20.3686 13.1067 20.1899 12.9985 20H3.45482C3.20352 20 2.99998 20.2261 2.99998 20.5053V21.4947C2.99998 21.7739 3.20352 22 3.45482 22H14.8733L13.4039 20.5306z"/><path d="M23.6568 15.9344C24.0473 16.3249 24.0473 16.9581 23.6568 17.3486L18.7162 22.2892L18.7072 22.2984C18.4669 22.5386 18.1348 22.6311 17.8238 22.5757C17.6293 22.5411 17.4431 22.4486 17.2929 22.2983L17.2852 22.2906L14.4645 19.4699C14.074 19.0794 14.074 18.4462 14.4645 18.0557C14.855 17.6652 15.4882 17.6652 15.8787 18.0557L18 20.177L22.2426 15.9344C22.6331 15.5438 23.2663 15.5438 23.6568 15.9344Z"/></svg>;
}

const IconCozVerifiedFill = React.forwardRef(IconCozVerifiedFillComponent);
export default IconCozVerifiedFill;
