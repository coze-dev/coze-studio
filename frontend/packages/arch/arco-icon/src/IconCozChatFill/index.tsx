import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozChatFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_chat_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 15.1688 2.3399 18.0247 4.48405 20.0319L3.72361 21.5528C3.39116 22.2177 3.87465 23 4.61803 23H12ZM8 10C8 9.44771 8.44772 9 9 9H16C16.5523 9 17 9.44771 17 10C17 10.5523 16.5523 11 16 11H9C8.44772 11 8 10.5523 8 10ZM9 13C8.44772 13 8 13.4477 8 14C8 14.5523 8.44772 15 9 15H13C13.5523 15 14 14.5523 14 14C14 13.4477 13.5523 13 13 13H9Z"/></svg>;
}

const IconCozChatFill = React.forwardRef(IconCozChatFillComponent);
export default IconCozChatFill;
