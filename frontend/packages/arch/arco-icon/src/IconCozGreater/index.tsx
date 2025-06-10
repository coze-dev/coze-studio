import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozGreaterComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_greater${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 25 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M19.9345 12.411C19.8856 12.5199 19.8169 12.6206 19.7301 12.7073C19.6634 12.7741 19.5884 12.8301 19.5078 12.8747L7.83147 19.6161C7.35317 19.8922 6.74158 19.7283 6.46544 19.25C6.1893 18.7718 6.35317 18.1602 6.83147 17.884L17.0228 12L6.83147 6.11607C6.35317 5.83993 6.1893 5.22834 6.46544 4.75004C6.74158 4.27175 7.35317 4.10788 7.83147 4.38402L19.5078 11.1254C19.5884 11.17 19.6634 11.226 19.7301 11.2928C19.8169 11.3795 19.8856 11.4802 19.9345 11.5891C19.9944 11.7215 20.0231 11.8616 20.023 12C20.0231 12.1385 19.9944 12.2786 19.9345 12.411Z"/></svg>;
}

const IconCozGreater = React.forwardRef(IconCozGreaterComponent);
export default IconCozGreater;
