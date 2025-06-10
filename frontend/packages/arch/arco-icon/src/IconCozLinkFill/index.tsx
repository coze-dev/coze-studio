import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozLinkFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_link_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M18.0424 6.02184C19.1927 7.17217 19.1965 9.04608 18.0739 10.1687C17.4881 10.7545 17.4881 11.7042 18.0739 12.29C18.6597 12.8758 19.6094 12.8758 20.1952 12.29C22.517 9.96821 22.4578 6.19461 20.1637 3.90052C17.8345 1.57128 14.0033 1.51142 11.6463 3.86838L9.2775 6.23718C6.97341 8.54128 6.97341 12.2769 9.27751 14.581L9.34822 14.6518C9.934 15.2375 10.8837 15.2375 11.4695 14.6518C12.0553 14.066 12.0553 13.1162 11.4695 12.5304L11.3988 12.4597C10.2663 11.3272 10.2663 9.49102 11.3988 8.3585L13.7676 5.9897C14.9254 4.83193 16.8569 4.83636 18.0424 6.02184Z"/><path d="M5.95756 17.9783C4.80722 16.8279 4.80344 14.954 5.92606 13.8314C6.51184 13.2456 6.51184 12.2959 5.92606 11.7101C5.34027 11.1243 4.39052 11.1243 3.80474 11.7101C1.48293 14.0319 1.54214 17.8055 3.83624 20.0996C6.16548 22.4288 9.9967 22.4887 12.3537 20.1317L14.7225 17.7629C17.0266 15.4588 17.0266 11.7232 14.7225 9.41906L14.6518 9.34835C14.066 8.76257 13.1162 8.76257 12.5304 9.34835C11.9446 9.93414 11.9446 10.8839 12.5304 11.4697L12.6011 11.5404C13.7337 12.6729 13.7337 14.5091 12.6011 15.6416L10.2323 18.0104C9.07457 19.1682 7.14303 19.1637 5.95756 17.9783Z"/></svg>;
}

const IconCozLinkFill = React.forwardRef(IconCozLinkFillComponent);
export default IconCozLinkFill;
