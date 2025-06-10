import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozMarginTopComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_margin_top${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M22 3C22 2.44772 21.5523 2 21 2H3C2.44772 2 2 2.44772 2 3C2 3.55229 2.44772 4 3 4L21 4C21.5523 4 22 3.55229 22 3Z"/><path fillRule="evenodd" clipRule="evenodd" d="M3 7.5C3 6.39543 3.89543 5.5 5 5.5H19C20.1046 5.5 21 6.39543 21 7.5V21C21 22.1046 20.1046 23 19 23H5C3.89543 23 3 22.1046 3 21V7.5ZM5 7.5H19V21H5V7.5Z"/></svg>;
}

const IconCozMarginTop = React.forwardRef(IconCozMarginTopComponent);
export default IconCozMarginTop;
