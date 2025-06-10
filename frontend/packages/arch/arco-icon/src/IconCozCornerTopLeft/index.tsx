import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozCornerTopLeftComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_corner_top_left${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M6 11C6 8.23858 8.23858 6 11 6H19C19.5523 6 20 5.55228 20 5C20 4.44772 19.5523 4 19 4H11C7.13401 4 4 7.13401 4 11V19C4 19.5523 4.44772 20 5 20C5.55228 20 6 19.5523 6 19V11Z"/></svg>;
}

const IconCozCornerTopLeft = React.forwardRef(IconCozCornerTopLeftComponent);
export default IconCozCornerTopLeft;
