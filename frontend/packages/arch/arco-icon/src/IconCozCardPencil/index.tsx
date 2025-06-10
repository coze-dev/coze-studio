import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozCardPencilComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_card_pencil${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M2.99994 18L2.99994 4L20.9999 4V11.451C21.6197 11.127 22.329 11.0345 22.9999 11.1733V4C22.9999 2.89543 22.1045 2 20.9999 2H2.99994C1.89537 2 0.999939 2.89543 0.999939 4V18C0.999939 19.1046 1.89537 20 2.99994 20H12.544C12.6881 19.6676 12.894 19.3634 13.153 19.1044L14.2574 18L2.99994 18Z"/><path d="M6.99994 7C6.44765 7 5.99994 7.44771 5.99994 8 5.99994 8.55229 6.44765 9 6.99994 9H16.9999C17.5522 9 17.9999 8.55228 17.9999 8 17.9999 7.44771 17.5522 7 16.9999 7H6.99994zM5.99994 13C5.99994 12.4477 6.44765 12 6.99994 12H12.9999C13.5522 12 13.9999 12.4477 13.9999 13 13.9999 13.5523 13.5522 14 12.9999 14H6.99994C6.44765 14 5.99994 13.5523 5.99994 13zM23.4499 13.0502C22.8641 12.4644 21.9143 12.4644 21.3286 13.0502L20.2679 14.1108 22.3892 16.2322 23.4499 15.1715C24.0357 14.5857 24.0357 13.636 23.4499 13.0502zM16.3465 22.2749L21.3286 17.2928 19.2072 15.1715 14.2136 20.1651C14.012 20.3667 13.8771 20.6253 13.827 20.906L13.4913 22.788C13.4816 22.8426 13.4992 22.8985 13.5384 22.9377 13.5771 22.9764 13.6322 22.9941 13.6862 22.9851L15.5771 22.6706C15.8686 22.6222 16.1376 22.4838 16.3465 22.2749z"/></svg>;
}

const IconCozCardPencil = React.forwardRef(IconCozCardPencilComponent);
export default IconCozCardPencil;
