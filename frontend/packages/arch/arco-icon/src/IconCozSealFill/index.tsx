import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozSealFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_seal_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M19.5 12.4985C20.6045 12.4985 21.5 13.3939 21.5 14.4985V17.4985C21.5 18.0508 21.0523 18.4985 20.5 18.4985H3.50003C2.94775 18.4985 2.50004 18.0508 2.50003 17.4985L2.5 14.4985C2.49999 13.3939 3.39542 12.4985 4.5 12.4985H7.68013C8.10575 12.4985 8.48473 12.2291 8.6246 11.8271L9.74683 8.60169C9.89017 8.26397 9.79246 7.87853 9.51615 7.63727 8.72225 6.94398 8.21795 5.92978 8.21795 4.79276 8.21795 2.43098 10.3766.573507 12.8287 1.08549 14.2586 1.384 15.4149 2.53906 15.7165 3.96837 16.0215 5.4122 15.5022 6.74836 14.5449 7.60802 14.2768 7.84886 14.1866 8.22891 14.3272 8.56061L15.4637 11.8271C15.6036 12.2291 15.9826 12.4985 16.4082 12.4985H19.5zM3.45482 20H20.5451C20.7964 20 21 20.2264 21 20.5053V21.4947C21 21.7739 20.7964 22 20.5451 22H3.45482C3.20352 22 2.99998 21.7739 2.99998 21.4947V20.5053C2.99998 20.2261 3.20352 20 3.45482 20z"/></svg>;
}

const IconCozSealFill = React.forwardRef(IconCozSealFillComponent);
export default IconCozSealFill;
