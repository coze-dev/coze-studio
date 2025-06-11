import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozBracketComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_bracket${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M4 2C2.89543 2 2 2.89543 2 4V20C2 21.1046 2.89543 22 4 22H8C8.55228 22 9 21.5523 9 21 9 20.4477 8.55228 20 8 20H4V4H8C8.55228 4 9 3.55228 9 3 9 2.44772 8.55228 2 8 2H4zM20 2C21.1046 2 22 2.89543 22 4V20C22 21.1046 21.1046 22 20 22H16C15.4477 22 15 21.5523 15 21 15 20.4477 15.4477 20 16 20H20V4H16C15.4477 4 15 3.55228 15 3 15 2.44772 15.4477 2 16 2H20z"/></svg>;
}

const IconCozBracket = React.forwardRef(IconCozBracketComponent);
export default IconCozBracket;
