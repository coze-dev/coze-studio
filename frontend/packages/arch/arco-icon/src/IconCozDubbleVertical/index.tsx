import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozDubbleVerticalComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_dubble_vertical${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M4.024 9.37583L7.97375 5.42608V21C7.97375 21.5523 8.42146 22 8.97375 22C9.52603 22 9.97375 21.5523 9.97375 21V3C9.97375 2.44772 9.52603 2 8.97375 2C8.65086 2 8.36372 2.15303 8.18088 2.39052L2.60979 7.96162C2.21926 8.35214 2.21926 8.98531 2.60979 9.37583C3.00031 9.76636 3.63348 9.76636 4.024 9.37583ZM19.976 14.6242L16.0263 18.5739V3C16.0263 2.44772 15.5785 2 15.0263 2C14.474 2 14.0263 2.44772 14.0263 3V21C14.0263 21.5523 14.474 22 15.0263 22C15.3491 22 15.6363 21.847 15.8191 21.6095L21.3902 16.0384C21.7807 15.6479 21.7807 15.0147 21.3902 14.6242C20.9997 14.2336 20.3665 14.2336 19.976 14.6242Z"/></svg>;
}

const IconCozDubbleVertical = React.forwardRef(IconCozDubbleVerticalComponent);
export default IconCozDubbleVertical;
