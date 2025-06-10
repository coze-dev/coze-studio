import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozHandleComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_handle${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M8.75 6.5C9.7165 6.5 10.5 5.7165 10.5 4.75 10.5 3.7835 9.7165 3 8.75 3 7.7835 3 7 3.7835 7 4.75 7 5.7165 7.7835 6.5 8.75 6.5zM8.75 13.75C9.7165 13.75 10.5 12.9665 10.5 12 10.5 11.0335 9.7165 10.25 8.75 10.25 7.7835 10.25 7 11.0335 7 12 7 12.9665 7.7835 13.75 8.75 13.75zM10.5 19.25C10.5 20.2165 9.7165 21 8.75 21 7.7835 21 7 20.2165 7 19.25 7 18.2835 7.7835 17.5 8.75 17.5 9.7165 17.5 10.5 18.2835 10.5 19.25zM15.2534 6.5C16.2199 6.5 17.0034 5.7165 17.0034 4.75 17.0034 3.7835 16.2199 3 15.2534 3 14.2869 3 13.5034 3.7835 13.5034 4.75 13.5034 5.7165 14.2869 6.5 15.2534 6.5zM17 12C17 12.9665 16.2165 13.75 15.25 13.75 14.2835 13.75 13.5 12.9665 13.5 12 13.5 11.0335 14.2835 10.25 15.25 10.25 16.2165 10.25 17 11.0335 17 12zM15.2534 21C16.2199 21 17.0034 20.2165 17.0034 19.25 17.0034 18.2835 16.2199 17.5 15.2534 17.5 14.2869 17.5 13.5034 18.2835 13.5034 19.25 13.5034 20.2165 14.2869 21 15.2534 21z"/></svg>;
}

const IconCozHandle = React.forwardRef(IconCozHandleComponent);
export default IconCozHandle;
