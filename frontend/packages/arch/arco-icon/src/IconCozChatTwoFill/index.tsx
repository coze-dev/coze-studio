import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozChatTwoFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_chat_two_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M19.5 11C19.5 16.2467 15.2467 20.5 10 20.5H3.31134C2.52441 20.5 2.04582 19.6331 2.4651 18.9672L3.26376 17.6987C1.55561 15.9811 0.5 13.6138 0.5 11C0.5 5.75329 4.75329 1.5 10 1.5C15.2467 1.5 19.5 5.75329 19.5 11ZM7 8C6.44772 8 6 8.44772 6 9C6 9.55229 6.44772 10 7 10H13C13.5523 10 14 9.55229 14 9C14 8.44772 13.5523 8 13 8H7ZM6 13C6 12.4477 6.44772 12 7 12H11C11.5523 12 12 12.4477 12 13C12 13.5523 11.5523 14 11 14H7C6.44772 14 6 13.5523 6 13Z"/><path d="M21 11C21 15.6527 18.1113 19.6307 14.0296 21.2385C14.6575 21.409 15.3181 21.5 16 21.5H20.9086C21.6455 21.5 22.1293 20.7301 21.8096 20.0662L21.3966 19.2083C22.6989 17.8593 23.5 16.0232 23.5 14C23.5 11.5956 22.3686 9.45542 20.609 8.08291C20.8639 9.01193 21 9.99007 21 11Z"/></svg>;
}

const IconCozChatTwoFill = React.forwardRef(IconCozChatTwoFillComponent);
export default IconCozChatTwoFill;
