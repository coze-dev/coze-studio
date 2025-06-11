import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozEasyInOutComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_easy_in_out${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M10.8419 18.773C9.38258 20.7936 6.96927 22 3 22C2.44772 22 2 21.5523 2 21C2 20.4477 2.44772 20 3 20C6.53073 20 8.24242 18.9564 9.22057 17.602C10.276 16.1406 10.6286 14.1457 11.0136 11.8356C11.0202 11.7959 11.0269 11.756 11.0335 11.7161C11.3933 9.55498 11.8011 7.10587 13.1581 5.22701C14.6174 3.20638 17.0307 2 21 2C21.5523 2 22 2.44772 22 3C22 3.55228 21.5523 4 21 4C17.4693 4 15.7576 5.04362 14.7794 6.39799C13.724 7.85942 13.3714 9.85433 12.9864 12.1644C12.9798 12.2041 12.9731 12.244 12.9665 12.2839C12.6067 14.445 12.1989 16.8941 10.8419 18.773Z"/></svg>;
}

const IconCozEasyInOut = React.forwardRef(IconCozEasyInOutComponent);
export default IconCozEasyInOut;
