import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozCornerBottomLeftComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_corner_bottom_left${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M6 13C6 15.7614 8.23858 18 11 18H19C19.5523 18 20 18.4477 20 19C20 19.5523 19.5523 20 19 20H11C7.13401 20 4 16.866 4 13V5C4 4.44771 4.44772 4 5 4C5.55228 4 6 4.44771 6 5V13Z"/></svg>;
}

const IconCozCornerBottomLeft = React.forwardRef(IconCozCornerBottomLeftComponent);
export default IconCozCornerBottomLeft;
