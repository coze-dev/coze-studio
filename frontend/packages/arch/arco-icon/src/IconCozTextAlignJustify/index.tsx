import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozTextAlignJustifyComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_text_align_justify${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M2 4C2 3.44772 2.44772 3 3 3H21C21.5523 3 22 3.44772 22 4 22 4.55228 21.5523 5 21 5H3C2.44772 5 2 4.55228 2 4zM2 12C2 11.4477 2.44772 11 3 11H21C21.5523 11 22 11.4477 22 12 22 12.5523 21.5523 13 21 13H3C2.44772 13 2 12.5523 2 12zM3 19C2.44772 19 2 19.4477 2 20 2 20.5523 2.44772 21 3 21H21C21.5523 21 22 20.5523 22 20 22 19.4477 21.5523 19 21 19H3z"/></svg>;
}

const IconCozTextAlignJustify = React.forwardRef(IconCozTextAlignJustifyComponent);
export default IconCozTextAlignJustify;
