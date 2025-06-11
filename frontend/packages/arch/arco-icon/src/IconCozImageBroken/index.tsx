import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozImageBrokenComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_image_broken${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M16.0414 2H3C1.9 2 1 2.9 1 4V20C1 21.1 1.9 22 3 22H4.49441L5.64911 20H3V4H14.8867L16.0414 2Z"/><path d="M9.43777 13.4378L9.21205 13.2121C9.0949 13.095 8.90495 13.095 8.78779 13.2121L4.51205 17.4879C4.32306 17.6769 4.45691 18 4.72419 18H6.80381L9.43777 13.4378zM10.2679 18L12.0001 14.9997 18.4877 8.51213C18.6767 8.32314 18.9998 8.45699 18.9998 8.72426V17.7C18.9998 17.8657 18.8655 18 18.6998 18H13.2768L13.2757 18H10.2679z"/><path d="M9.11321 20H21V4H18.3508L19.5055 2H21C22.1 2 23 2.9 23 4V20C23 21.1 22.1 22 21 22H7.95851L9.11321 20zM9 8C9 9.10457 8.10457 10 7 10 5.89543 10 5 9.10457 5 8 5 6.89543 5.89543 6 7 6 8.10457 6 9 6.89543 9 8z"/></svg>;
}

const IconCozImageBroken = React.forwardRef(IconCozImageBrokenComponent);
export default IconCozImageBroken;
