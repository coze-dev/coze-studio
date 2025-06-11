import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozMarginLeftComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_margin_left${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M3 2C2.44772 2 2 2.44772 2 3L2 21C2 21.5523 2.44772 22 3 22C3.55229 22 4 21.5523 4 21V3C4 2.44772 3.55229 2 3 2Z"/><path fillRule="evenodd" clipRule="evenodd" d="M7.5 21C6.39543 21 5.5 20.1046 5.5 19L5.5 5C5.5 3.89543 6.39543 3 7.5 3L21 3C22.1046 3 23 3.89543 23 5V19C23 20.1046 22.1046 21 21 21H7.5ZM7.5 19L7.5 5L21 5V19H7.5Z"/></svg>;
}

const IconCozMarginLeft = React.forwardRef(IconCozMarginLeftComponent);
export default IconCozMarginLeft;
