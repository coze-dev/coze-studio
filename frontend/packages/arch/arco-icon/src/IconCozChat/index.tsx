import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozChatComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_chat${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M8 10C8 9.44771 8.44772 9 9 9H16C16.5523 9 17 9.44771 17 10 17 10.5523 16.5523 11 16 11H9C8.44772 11 8 10.5523 8 10zM9 13C8.44772 13 8 13.4477 8 14 8 14.5523 8.44772 15 9 15H13C13.5523 15 14 14.5523 14 14 14 13.4477 13.5523 13 13 13H9z"/><path fillRule="evenodd" clipRule="evenodd" d="M23 12C23 18.0751 18.0751 23 12 23H4.61803C3.87465 23 3.39116 22.2177 3.72361 21.5528L4.48405 20.0319C2.3399 18.0247 1 15.1688 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12ZM6.94025 19.5916L6.23607 21H12C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 14.5928 4.09379 16.9269 5.85088 18.5718L6.94025 19.5916Z"/></svg>;
}

const IconCozChat = React.forwardRef(IconCozChatComponent);
export default IconCozChat;
