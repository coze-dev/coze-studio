import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozImageComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_image${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M18.9998 8.72426V17.7C18.9998 17.8657 18.8655 18 18.6998 18H13.2768L13.2757 18H4.72419C4.45691 18 4.32306 17.6769 4.51205 17.4879L8.78779 13.2121C8.90495 13.095 9.0949 13.095 9.21205 13.2121L11.4999 15.5 18.4877 8.51213C18.6767 8.32314 18.9998 8.45699 18.9998 8.72426zM7 10C8.10457 10 9 9.10457 9 8 9 6.89543 8.10457 6 7 6 5.89543 6 5 6.89543 5 8 5 9.10457 5.89543 10 7 10z"/><path fillRule="evenodd" clipRule="evenodd" d="M1 4C1 2.9 1.9 2 3 2H21C22.1 2 23 2.9 23 4V20C23 21.1 22.1 22 21 22H3C1.9 22 1 21.1 1 20V4ZM21 4H3V20H21V4Z"/></svg>;
}

const IconCozImage = React.forwardRef(IconCozImageComponent);
export default IconCozImage;
