import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozEasyInComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_easy_in${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M21.3657 2.06927C21.8797 2.27122 22.1327 2.85164 21.9308 3.36568C19.1842 10.3568 16.8733 15.0371 14.0277 17.949C11.0969 20.9479 7.67847 22 3 22C2.44772 22 2 21.5523 2 21C2 20.4477 2.44772 20 3 20C7.32153 20 10.1531 19.0521 12.5973 16.5511C15.1267 13.9629 17.3158 9.64323 20.0692 2.63437C20.2712 2.12033 20.8516 1.86733 21.3657 2.06927Z"/></svg>;
}

const IconCozEasyIn = React.forwardRef(IconCozEasyInComponent);
export default IconCozEasyIn;
