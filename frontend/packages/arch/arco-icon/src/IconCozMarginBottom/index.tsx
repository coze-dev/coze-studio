import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozMarginBottomComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_margin_bottom${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M2 21C2 21.5523 2.44772 22 3 22L21 22C21.5523 22 22 21.5523 22 21C22 20.4477 21.5523 20 21 20L3 20C2.44772 20 2 20.4477 2 21Z"/><path fillRule="evenodd" clipRule="evenodd" d="M21 16.5C21 17.6046 20.1046 18.5 19 18.5L5 18.5C3.89543 18.5 3 17.6046 3 16.5L3 3C3 1.89543 3.89543 1 5 1L19 1C20.1046 1 21 1.89543 21 3L21 16.5ZM19 16.5L5 16.5L5 3L19 3L19 16.5Z"/></svg>;
}

const IconCozMarginBottom = React.forwardRef(IconCozMarginBottomComponent);
export default IconCozMarginBottom;
