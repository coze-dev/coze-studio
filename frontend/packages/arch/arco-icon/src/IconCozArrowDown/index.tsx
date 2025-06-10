import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozArrowDownComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_arrow_down${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 25 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M4.39873 10.1716L11.4698 17.2427C11.8603 17.6332 12.4935 17.6332 12.884 17.2427L19.9551 10.1716C20.3456 9.78106 20.3456 9.1479 19.9551 8.75737C19.5646 8.36685 18.9314 8.36685 18.5409 8.75737L12.1769 15.1213L5.81294 8.75737C5.42242 8.36685 4.78925 8.36685 4.39873 8.75737C4.0082 9.1479 4.0082 9.78106 4.39873 10.1716Z"/></svg>;
}

const IconCozArrowDown = React.forwardRef(IconCozArrowDownComponent);
export default IconCozArrowDown;
