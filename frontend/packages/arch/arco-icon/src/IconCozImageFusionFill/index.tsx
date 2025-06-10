import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozImageFusionFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_image_fusion_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M7.88813 11.4485C8.68813 11.2342 9.16289 10.4119 8.94853 9.61187C8.73417 8.81187 7.91187 8.33711 7.11187 8.55147C6.31187 8.76583 5.83711 9.58813 6.05147 10.3881C6.26583 11.1881 7.08813 11.6629 7.88813 11.4485Z"/><path fillRule="evenodd" clipRule="evenodd" d="M11 1.5C9.89543 1.5 9 2.39543 9 3.5V4.5H4C2.89543 4.5 2 5.39543 2 6.5V20.5C2 21.6046 2.89543 22.5 4 22.5H8.96582V21.1876C8.96582 20.0736 9.8689 19.1706 10.9829 19.1706C12.0969 19.1706 13 20.0736 13 21.1876V22.5H18C19.1046 22.5 20 21.6046 20 20.5V15.5H21C22.1046 15.5 23 14.6046 23 13.5C23 12.3954 22.1046 11.5 21 11.5H20V6.5C20 5.39543 19.1046 4.5 18 4.5H13V3.5C13 2.39543 12.1046 1.5 11 1.5ZM4 16.0453V6.5H18V14.4629L15.9125 12.5486C15.531 12.1987 14.9455 12.1979 14.5629 12.5467L10.8349 15.9459C10.5042 16.2474 10.0135 16.2926 9.63339 16.0564L7.00873 14.4259C6.64219 14.1982 6.17093 14.2313 5.83981 14.5079L4 16.0453Z"/></svg>;
}

const IconCozImageFusionFill = React.forwardRef(IconCozImageFusionFillComponent);
export default IconCozImageFusionFill;
