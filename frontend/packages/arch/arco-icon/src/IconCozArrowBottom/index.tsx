import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozArrowBottomComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_arrow_bottom${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M21 23C21.5523 23 22 22.5523 22 22 22 21.4477 21.5523 21 21 21H3C2.44772 21 2 21.4477 2 22 2 22.5523 2.44772 23 3 23H21zM11.2929 18.7071C11.6834 19.0976 12.3166 19.0976 12.7071 18.7071L19.7071 11.7071C20.0976 11.3166 20.0976 10.6834 19.7071 10.2929 19.3166 9.90237 18.6834 9.90237 18.2929 10.2929L13 15.5858 13 2C13 1.44772 12.5523 1 12 1 11.4477 1 11 1.44772 11 2L11 15.5858 5.70711 10.2929C5.31658 9.90237 4.68342 9.90237 4.29289 10.2929 3.90237 10.6834 3.90237 11.3166 4.29289 11.7071L11.2929 18.7071z"/></svg>;
}

const IconCozArrowBottom = React.forwardRef(IconCozArrowBottomComponent);
export default IconCozArrowBottom;
