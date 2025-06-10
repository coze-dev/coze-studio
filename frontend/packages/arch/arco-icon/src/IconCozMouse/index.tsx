import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozMouseComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_mouse${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M4.5 8C4.5 4.13401 7.63401 1 11.5 1H12.5C16.366 1 19.5 4.13401 19.5 8V17C19.5 20.3137 16.8137 23 13.5 23H10.5C7.18629 23 4.5 20.3137 4.5 17V8ZM11.2517 3.00606C8.60561 3.13547 6.5 5.32184 6.5 8V17C6.5 19.2091 8.29086 21 10.5 21H13.5C15.7091 21 17.5 19.2091 17.5 17V8C17.5 5.32297 15.3962 3.13732 12.7517 3.00622V5.28013C13.2606 5.54331 13.6074 6.06549 13.6074 6.66669V8.75759C13.6074 9.35879 13.2606 9.88097 12.7517 10.1441V11.4091C12.7517 11.8233 12.4159 12.1591 12.0017 12.1591C11.5875 12.1591 11.2517 11.8233 11.2517 11.4091V10.1457C10.7411 9.88298 10.3931 9.35994 10.3931 8.75759V6.66669C10.3931 6.06433 10.7411 5.5413 11.2517 5.27862V3.00606ZM12.0017 6.14397C11.7059 6.14397 11.466 6.38381 11.466 6.67968V8.74462C11.466 9.03907 11.7036 9.27804 11.9975 9.28031L12.0002 9.28032C12.0456 9.28032 12.0896 9.27482 12.1316 9.26447C12.3401 9.21256 12.5002 9.0386 12.5318 8.82287C12.5345 8.80149 12.5359 8.7797 12.5359 8.75759V6.66669C12.5359 6.64463 12.5345 6.62288 12.5318 6.60154C12.4999 6.38354 12.3368 6.20817 12.1252 6.15826C12.0856 6.14891 12.0442 6.14397 12.0017 6.14397Z"/></svg>;
}

const IconCozMouse = React.forwardRef(IconCozMouseComponent);
export default IconCozMouse;
