import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozMarginRightComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_margin_right${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M21 22C21.5523 22 22 21.5523 22 21V3C22 2.44772 21.5523 2 21 2C20.4477 2 20 2.44772 20 3L20 21C20 21.5523 20.4477 22 21 22Z"/><path fillRule="evenodd" clipRule="evenodd" d="M16.5 3C17.6046 3 18.5 3.89543 18.5 5V19C18.5 20.1046 17.6046 21 16.5 21H3C1.89543 21 1 20.1046 1 19L1 5C1 3.89543 1.89543 3 3 3L16.5 3ZM16.5 5L16.5 19H3L3 5L16.5 5Z"/></svg>;
}

const IconCozMarginRight = React.forwardRef(IconCozMarginRightComponent);
export default IconCozMarginRight;
