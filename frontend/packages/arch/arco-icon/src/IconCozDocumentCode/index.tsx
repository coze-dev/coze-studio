import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozDocumentCodeComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_document_code${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M19 3H5L5 21H8.53286L10.5329 23H5C3.89543 23 3 22.1046 3 21V3C3 1.89543 3.89543 1 5 1H19C20.1046 1 21 1.89543 21 3V13.7767C20.4437 13.2561 19.7075 13.0373 19 13.1203V3Z"/><path d="M8 5.99707C7.44772 5.99707 7 6.44479 7 6.99707 7 7.54936 7.44772 7.99707 8 7.99707H16C16.5523 7.99707 17 7.54936 17 6.99707 17 6.44479 16.5523 5.99707 16 5.99707H8zM7 11.0195C7 10.4672 7.44772 10.0195 8 10.0195H11C11.5523 10.0195 12 10.4672 12 11.0195 12 11.5718 11.5523 12.0195 11 12.0195H8C7.44772 12.0195 7 11.5718 7 11.0195zM14.0445 22.6896C13.9486 23.2335 14.3118 23.7522 14.8556 23.8481 15.3995 23.944 15.9182 23.5808 16.0141 23.0369L17.5769 14.1737C17.6728 13.6298 17.3097 13.1111 16.7658 13.0152 16.2219 12.9193 15.7032 13.2825 15.6073 13.8264L14.0445 22.6896zM8.79289 19.1388C8.40237 18.7483 8.40237 18.1151 8.79289 17.7246L11.6213 14.8962C12.0118 14.5056 12.645 14.5056 13.0355 14.8962 13.4261 15.2867 13.4261 15.9199 13.0355 16.3104L10.9142 18.4317 13.0355 20.553C13.4261 20.9435 13.4261 21.5767 13.0355 21.9672 12.645 22.3578 12.0118 22.3578 11.6213 21.9672L8.79289 19.1388zM20 21.9672C19.6095 22.3578 18.9763 22.3578 18.5858 21.9672 18.1953 21.5767 18.1953 20.9435 18.5858 20.553L20.7071 18.4317 18.5858 16.3104C18.1953 15.9199 18.1953 15.2867 18.5858 14.8962 18.9763 14.5056 19.6095 14.5056 20 14.8962L22.8284 17.7246C23.219 18.1151 23.219 18.7483 22.8284 19.1388L20 21.9672z"/></svg>;
}

const IconCozDocumentCode = React.forwardRef(IconCozDocumentCodeComponent);
export default IconCozDocumentCode;
