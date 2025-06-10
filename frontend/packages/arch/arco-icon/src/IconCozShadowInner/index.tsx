import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozShadowInnerComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_shadow_inner${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M5.5 18.5V17.5913L7.5 15.5913V18.5H5.5zM18.5 7.5H15.5913L17.5913 5.5H18.5V7.5zM13.47 7.5L15.47 5.5H11.5913L9.59132 7.5H13.47zM5.5 15.47L7.5 13.47V9.59132L5.5 11.5913V15.47zM9.47 5.5H5.5V9.47L9.47 5.5z"/><path fillRule="evenodd" clipRule="evenodd" d="M2 4C2 2.89543 2.89543 2 4 2H20C21.1046 2 22 2.89543 22 4V20C22 21.1046 21.1046 22 20 22H4C2.89543 22 2 21.1046 2 20V4ZM4 4H20V20H4V4Z"/></svg>;
}

const IconCozShadowInner = React.forwardRef(IconCozShadowInnerComponent);
export default IconCozShadowInner;
