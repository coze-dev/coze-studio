import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozAlphabeticalComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_alphabetical${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M6.01619 21.9998C5.66218 22.0083 5.31464 21.8282 5.12511 21.4999L1.62511 15.4377C1.34897 14.9594 1.51284 14.3478 1.99113 14.0717 2.46943 13.7956 3.08102 13.9594 3.35716 14.4377L5.00006 17.2833 5.00006 2.9999C5.00006 2.44762 5.44778 1.9999 6.00006 1.9999 6.55235 1.9999 7.00006 2.44762 7.00006 2.9999L7.00006 20.9999C7.00006 21.5468 6.56104 21.9912 6.01619 21.9998zM9.48922 21.0188C9.48922 21.5606 9.92848 21.9999 10.4703 21.9999H20.5413C21.0715 21.9999 21.5012 21.5701 21.5012 21.04 21.5012 20.5005 21.0568 20.067 20.5174 20.0804L12.8252 20.2719 20.8436 15.4698C21.1771 15.2701 21.3812 14.91 21.3812 14.5213 21.3812 14.0124 20.9687 13.5999 20.4598 13.5999L10.6158 13.5999C10.0798 13.5999 9.64522 14.0345 9.64522 14.5705 9.64522 15.1123 10.0888 15.5492 10.6305 15.541L17.6012 15.4359 10.056 20.0121C9.70412 20.2256 9.48922 20.6072 9.48922 21.0188z"/><path fillRule="evenodd" clipRule="evenodd" d="M9.60585 11.1447C9.41883 11.5426 9.70918 11.9999 10.1489 11.9999H10.8148C11.2871 11.9999 11.7155 11.7228 11.9092 11.2921L12.7689 9.3804L18.1474 9.3804L18.9797 11.2812C19.1709 11.7178 19.6023 11.9999 20.079 11.9999L20.8535 11.9999C21.291 11.9999 21.5814 11.5467 21.3986 11.1492L17.1202 1.84842C16.9244 1.42269 16.4986 1.1499 16.03 1.1499L15.0653 1.1499C14.6003 1.1499 14.1771 1.41859 13.9793 1.83947L9.60585 11.1447ZM17.4499 7.5979H13.4819L15.2187 3.71014C15.3252 3.4718 15.6642 3.47375 15.7679 3.71331L17.4499 7.5979Z"/></svg>;
}

const IconCozAlphabetical = React.forwardRef(IconCozAlphabeticalComponent);
export default IconCozAlphabetical;
