import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozBadgeComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_badge${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M20 8C21.6569 8 23 6.65685 23 5C23 3.34315 21.6569 2 20 2C18.3431 2 17 3.34315 17 5C17 6.65685 18.3431 8 20 8Z"/><path d="M3 3H15.9678C15.6684 3.60248 15.5 4.28158 15.5 5H3V19H21V9.38849C21.7569 9.21675 22.4413 8.85423 23 8.35416V19C23 20.1046 22.1046 21 21 21H3C1.89543 21 1 20.1046 1 19V5C1 3.89543 1.89543 3 3 3Z"/></svg>;
}

const IconCozBadge = React.forwardRef(IconCozBadgeComponent);
export default IconCozBadge;
