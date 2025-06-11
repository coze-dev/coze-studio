import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozImageBracketComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_image_bracket${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M1 5C1 3.89543 1.89543 3 3 3H4C4.55228 3 5 3.44772 5 4 5 4.55228 4.55228 5 4 5H3V19H4C4.55228 19 5 19.4477 5 20 5 20.5523 4.55228 21 4 21H3C1.89543 21 1 20.1046 1 19V5zM23 5C23 3.89543 22.1046 3 21 3H20C19.4477 3 19 3.44772 19 4 19 4.55228 19.4477 5 20 5H21V19H20C19.4477 19 19 19.4477 19 20 19 20.5523 19.4477 21 20 21H21C22.1046 21 23 20.1046 23 19V5zM16.5001 10.4996V14.766C16.5001 14.8952 16.3953 15 16.2661 15H8.13266C7.91541 15 7.81543 14.7297 7.98038 14.5883L10.8478 12.1305C10.9354 12.0554 11.0648 12.0554 11.1524 12.1305L12.5283 13.3099 16.1163 10.3199C16.2687 10.1928 16.5001 10.3012 16.5001 10.4996zM9 11.5C9.55229 11.5 10 11.0523 10 10.5 10 9.94772 9.55229 9.5 9 9.5 8.44772 9.5 8 9.94772 8 10.5 8 11.0523 8.44772 11.5 9 11.5z"/><path fillRule="evenodd" clipRule="evenodd" d="M4.5 8C4.5 6.89543 5.39543 6 6.5 6H17.5C18.6046 6 19.5 6.89543 19.5 8V16C19.5 17.1046 18.6046 18 17.5 18H6.5C5.39543 18 4.5 17.1046 4.5 16V8ZM6.5 8H17.5V16H6.5V8Z"/></svg>;
}

const IconCozImageBracket = React.forwardRef(IconCozImageBracketComponent);
export default IconCozImageBracket;
