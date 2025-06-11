import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozImageArrowUpComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_image_arrow_up${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M1 4C1 2.9 1.9 2 3 2H21C22.1 2 23 2.9 23 4V15.4645L21 13.4645V4H3V20H13.4379C13.5148 20.1062 13.6011 20.2076 13.6967 20.3033C14.4547 21.0613 15.5785 21.2308 16.5 20.8117V22H3C1.9 22 1 21.1 1 20V4Z"/><path d="M18.9998 8.72426V12.5C18.3291 12.5 17.7201 12.7642 17.2712 13.1941 17.2565 13.2082 17.242 13.2224 17.2277 13.2368L13.6967 16.7678C13.3456 17.1189 13.1208 17.5484 13.0222 18H4.72419C4.45691 18 4.32306 17.6769 4.51205 17.4879L8.78779 13.2121C8.90495 13.095 9.0949 13.095 9.21205 13.2121L11.4999 15.5 18.4877 8.51213C18.6767 8.32314 18.9998 8.45699 18.9998 8.72426zM7 10C8.10457 10 9 9.10457 9 8 9 6.89543 8.10457 6 7 6 5.89543 6 5 6.89543 5 8 5 9.10457 5.89543 10 7 10zM19 14C19.1334 14 19.2608 14.0261 19.3772 14.0736 19.4972 14.1224 19.6097 14.1955 19.7071 14.2929L23.2427 17.8284C23.6332 18.219 23.6332 18.8521 23.2427 19.2426 22.8521 19.6332 22.219 19.6332 21.8284 19.2426L20 17.4142V23C20 23.5523 19.5523 24 19 24 18.4477 24 18 23.5523 18 23V17.4142L16.1716 19.2426C15.7811 19.6332 15.1479 19.6332 14.7574 19.2426 14.3668 18.8521 14.3668 18.219 14.7574 17.8284L18.29 14.2957C18.299 14.2867 18.3081 14.2779 18.3174 14.2692 18.4961 14.1022 18.7361 14 19 14z"/></svg>;
}

const IconCozImageArrowUp = React.forwardRef(IconCozImageArrowUpComponent);
export default IconCozImageArrowUp;
