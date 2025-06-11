import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozBooleanBracketComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_boolean_bracket${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M1 5C1 3.89543 1.89543 3 3 3H4C4.55228 3 5 3.44772 5 4 5 4.55228 4.55228 5 4 5H3V19H4C4.55228 19 5 19.4477 5 20 5 20.5523 4.55228 21 4 21H3C1.89543 21 1 20.1046 1 19V5zM23 5C23 3.89543 22.1046 3 21 3H20C19.4477 3 19 3.44772 19 4 19 4.55228 19.4477 5 20 5H21V19H20C19.4477 19 19 19.4477 19 20 19 20.5523 19.4477 21 20 21H21C22.1046 21 23 20.1046 23 19V5z"/><path fillRule="evenodd" clipRule="evenodd" d="M10 17.5C10.7056 17.5 11.3802 17.3671 12 17.125C12.6199 17.3671 13.2945 17.5 14.0001 17.5C17.0376 17.5 19.5 15.0376 19.5 12C19.5 8.96243 17.0376 6.5 14.0001 6.5C13.2945 6.5 12.6199 6.63287 12 6.87495C11.3802 6.63287 10.7056 6.5 10 6.5C6.96243 6.5 4.5 8.96243 4.5 12C4.5 15.0376 6.96243 17.5 10 17.5ZM10 15.5C11.933 15.5 13.5 13.933 13.5 12C13.5 10.067 11.933 8.5 10 8.5C8.067 8.5 6.5 10.067 6.5 12C6.5 13.933 8.067 15.5 10 15.5Z"/></svg>;
}

const IconCozBooleanBracket = React.forwardRef(IconCozBooleanBracketComponent);
export default IconCozBooleanBracket;
