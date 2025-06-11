import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozAutoViewComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_auto_view${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M4 2C2.89543 2 2 2.89543 2 4V8C2 8.55228 2.44772 9 3 9 3.55228 9 4 8.55228 4 8V4L8 4C8.55228 4 9 3.55228 9 3 9 2.44772 8.55228 2 8 2H4zM20 22C21.1046 22 22 21.1046 22 20V16C22 15.4477 21.5523 15 21 15 20.4477 15 20 15.4477 20 16V20H16C15.4477 20 15 20.4477 15 21 15 21.5523 15.4477 22 16 22H20zM22 4C22 2.89543 21.1046 2 20 2H16C15.4477 2 15 2.44772 15 3 15 3.55228 15.4477 4 16 4L20 4V8C20 8.55228 20.4477 9 21 9 21.5523 9 22 8.55228 22 8V4zM4 22C2.89543 22 2 21.1046 2 20V16C2 15.4477 2.44772 15 3 15 3.55228 15 4 15.4477 4 16V20H8C8.55228 20 9 20.4477 9 21 9 21.5523 8.55228 22 8 22H4z"/><path fillRule="evenodd" clipRule="evenodd" d="M8 6C6.89543 6 6 6.89543 6 8V16C6 17.1046 6.89543 18 8 18H16C17.1046 18 18 17.1046 18 16V8C18 6.89543 17.1046 6 16 6H8ZM8 8H16V16H8V8Z"/></svg>;
}

const IconCozAutoView = React.forwardRef(IconCozAutoViewComponent);
export default IconCozAutoView;
