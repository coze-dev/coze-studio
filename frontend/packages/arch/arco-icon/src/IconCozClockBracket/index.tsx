import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozClockBracketComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_clock_bracket${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M1 5C1 3.89543 1.89543 3 3 3H4C4.55228 3 5 3.44772 5 4 5 4.55228 4.55228 5 4 5H3V19H4C4.55228 19 5 19.4477 5 20 5 20.5523 4.55228 21 4 21H3C1.89543 21 1 20.1046 1 19V5zM23 5C23 3.89543 22.1046 3 21 3H20C19.4477 3 19 3.44772 19 4 19 4.55228 19.4477 5 20 5H21V19H20C19.4477 19 19 19.4477 19 20 19 20.5523 19.4477 21 20 21H21C22.1046 21 23 20.1046 23 19V5zM11 9C11 8.44772 11.4477 8 12 8 12.5523 8 13 8.44772 13 9V11H15C15.5523 11 16 11.4477 16 12 16 12.5523 15.5523 13 15 13H12C11.4477 13 11 12.5523 11 12V9z"/><path fillRule="evenodd" clipRule="evenodd" d="M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12ZM18 12C18 15.3137 15.3137 18 12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12Z"/></svg>;
}

const IconCozClockBracket = React.forwardRef(IconCozClockBracketComponent);
export default IconCozClockBracket;
