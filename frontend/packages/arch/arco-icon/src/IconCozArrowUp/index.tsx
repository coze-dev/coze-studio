import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozArrowUpComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_arrow_up${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 25 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M19.9551 13.8284L12.884 6.75734C12.4935 6.36682 11.8603 6.36682 11.4698 6.75734L4.39873 13.8284C4.0082 14.2189 4.0082 14.8521 4.39873 15.2426C4.78925 15.6331 5.42242 15.6331 5.81294 15.2426L12.1769 8.87866L18.5409 15.2426C18.9314 15.6331 19.5646 15.6331 19.9551 15.2426C20.3456 14.8521 20.3456 14.2189 19.9551 13.8284Z"/></svg>;
}

const IconCozArrowUp = React.forwardRef(IconCozArrowUpComponent);
export default IconCozArrowUp;
