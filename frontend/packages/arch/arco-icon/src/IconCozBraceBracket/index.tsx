import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozBraceBracketComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_brace_bracket${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M1 5C1 3.89543 1.89543 3 3 3H4C4.55228 3 5 3.44772 5 4 5 4.55228 4.55228 5 4 5H3V19H4C4.55228 19 5 19.4477 5 20 5 20.5523 4.55228 21 4 21H3C1.89543 21 1 20.1046 1 19V5zM23 5C23 3.89543 22.1046 3 21 3H20C19.4477 3 19 3.44772 19 4 19 4.55228 19.4477 5 20 5H21V19H20C19.4477 19 19 19.4477 19 20 19 20.5523 19.4477 21 20 21H21C22.1046 21 23 20.1046 23 19V5z"/><path d="M6.13636 7.36364C6.13636 6.05824 7.1946 5 8.5 5 9.05229 5 9.5 5.44772 9.5 6 9.5 6.55228 9.05229 7 8.5 7 8.29917 7 8.13636 7.16281 8.13636 7.36364V10.3636C8.13636 10.9819 7.92355 11.5504 7.56719 12 7.92355 12.4496 8.13636 13.0181 8.13636 13.6364V16.6364C8.13636 16.8372 8.29917 17 8.5 17 9.05229 17 9.5 17.4477 9.5 18 9.5 18.5523 9.05229 19 8.5 19 7.1946 19 6.13636 17.9418 6.13636 16.6364V13.6364C6.13636 13.2849 5.85145 13 5.5 13 4.94772 13 4.5 12.5523 4.5 12 4.5 11.4477 4.94772 11 5.5 11 5.85145 11 6.13636 10.7151 6.13636 10.3636V7.36364zM17.8636 7.36364C17.8636 6.05824 16.8054 5 15.5 5 14.9477 5 14.5 5.44772 14.5 6 14.5 6.55228 14.9477 7 15.5 7 15.7008 7 15.8636 7.16281 15.8636 7.36364V10.3636C15.8636 10.9819 16.0764 11.5504 16.4328 12 16.0764 12.4496 15.8636 13.0181 15.8636 13.6364V16.6364C15.8636 16.8372 15.7008 17 15.5 17 14.9477 17 14.5 17.4477 14.5 18 14.5 18.5523 14.9477 19 15.5 19 16.8054 19 17.8636 17.9418 17.8636 16.6364V13.6364C17.8636 13.2849 18.1485 13 18.5 13 19.0523 13 19.5 12.5523 19.5 12 19.5 11.4477 19.0523 11 18.5 11 18.1485 11 17.8636 10.7151 17.8636 10.3636V7.36364z"/></svg>;
}

const IconCozBraceBracket = React.forwardRef(IconCozBraceBracketComponent);
export default IconCozBraceBracket;
