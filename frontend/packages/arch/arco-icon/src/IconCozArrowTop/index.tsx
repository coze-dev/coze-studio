import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozArrowTopComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_arrow_top${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M3 1C2.44772 1 2 1.44772 2 2 2 2.55228 2.44772 3 3 3H21C21.5523 3 22 2.55228 22 2 22 1.44772 21.5523 1 21 1H3zM12.7071 5.29289C12.3166 4.90237 11.6834 4.90237 11.2929 5.29289L4.29289 12.2929C3.90237 12.6834 3.90237 13.3166 4.29289 13.7071 4.68342 14.0976 5.31658 14.0976 5.70711 13.7071L11 8.41421V22C11 22.5523 11.4477 23 12 23 12.5523 23 13 22.5523 13 22V8.41421L18.2929 13.7071C18.6834 14.0976 19.3166 14.0976 19.7071 13.7071 20.0976 13.3166 20.0976 12.6834 19.7071 12.2929L12.7071 5.29289z"/></svg>;
}

const IconCozArrowTop = React.forwardRef(IconCozArrowTopComponent);
export default IconCozArrowTop;
