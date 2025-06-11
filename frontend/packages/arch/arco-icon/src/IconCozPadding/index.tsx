import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozPaddingComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_padding${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M8 6.5C8 5.94772 8.44772 5.5 9 5.5H15C15.5523 5.5 16 5.94772 16 6.5 16 7.05228 15.5523 7.5 15 7.5H9C8.44772 7.5 8 7.05228 8 6.5zM16.5 15C16.5 15.5523 16.9477 16 17.5 16 18.0523 16 18.5 15.5523 18.5 15V9C18.5 8.44772 18.0523 8 17.5 8 16.9477 8 16.5 8.44772 16.5 9V15zM8 17.5C8 16.9477 8.44772 16.5 9 16.5H15C15.5523 16.5 16 16.9477 16 17.5 16 18.0523 15.5523 18.5 15 18.5H9C8.44772 18.5 8 18.0523 8 17.5zM5.5 15C5.5 15.5523 5.94772 16 6.5 16 7.05228 16 7.5 15.5523 7.5 15L7.5 9C7.5 8.44772 7.05229 8 6.5 8 5.94772 8 5.5 8.44772 5.5 9L5.5 15z"/><path fillRule="evenodd" clipRule="evenodd" d="M4 2C2.89543 2 2 2.89543 2 4V20C2 21.1046 2.89543 22 4 22H20C21.1046 22 22 21.1046 22 20V4C22 2.89543 21.1046 2 20 2H4ZM20 4H4V20H20V4Z"/></svg>;
}

const IconCozPadding = React.forwardRef(IconCozPaddingComponent);
export default IconCozPadding;
