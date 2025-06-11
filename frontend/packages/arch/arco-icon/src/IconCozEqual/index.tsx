import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozEqualComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_equal${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 25 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M4.177 8C3.62472 8 3.177 8.44772 3.177 9 3.177 9.55228 3.62472 10 4.177 10H20.177C20.7293 10 21.177 9.55228 21.177 9 21.177 8.44772 20.7293 8 20.177 8H4.177zM4.177 14C3.62472 14 3.177 14.4477 3.177 15 3.177 15.5523 3.62472 16 4.177 16H20.177C20.7293 16 21.177 15.5523 21.177 15 21.177 14.4477 20.7293 14 20.177 14H4.177z"/></svg>;
}

const IconCozEqual = React.forwardRef(IconCozEqualComponent);
export default IconCozEqual;
