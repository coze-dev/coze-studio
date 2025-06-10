import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozDubbleHorizontalComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_dubble_horizontal${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 25 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M15.2475 4.024L19.1972 7.97375L3.62329 7.97375C3.07101 7.97375 2.62329 8.42146 2.62329 8.97375C2.62329 9.52603 3.07101 9.97375 3.62329 9.97375L21.6233 9.97375C22.1756 9.97375 22.6233 9.52603 22.6233 8.97375C22.6233 8.65086 22.4703 8.36372 22.2328 8.18088L16.6617 2.60979C16.2712 2.21926 15.638 2.21926 15.2475 2.60979C14.8569 3.00031 14.8569 3.63348 15.2475 4.024ZM9.99912 19.976L6.04937 16.0263H21.6233C22.1756 16.0263 22.6233 15.5785 22.6233 15.0263C22.6233 14.474 22.1756 14.0263 21.6233 14.0263L3.62329 14.0263C3.07101 14.0263 2.62329 14.474 2.62329 15.0263C2.62329 15.3491 2.77632 15.6363 3.01381 15.8191L8.58491 21.3902C8.97543 21.7807 9.6086 21.7807 9.99912 21.3902C10.3896 20.9997 10.3896 20.3665 9.99912 19.976Z"/></svg>;
}

const IconCozDubbleHorizontal = React.forwardRef(IconCozDubbleHorizontalComponent);
export default IconCozDubbleHorizontal;
