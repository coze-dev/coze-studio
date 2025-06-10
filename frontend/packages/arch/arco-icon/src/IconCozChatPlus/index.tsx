import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozChatPlusComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_chat_plus${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M6.94025 19.5916L6.23607 21H12C13.039 21 14.0369 20.8239 14.9655 20.5H15.5V22C15.5 22.143 15.512 22.2832 15.5351 22.4196C14.4256 22.7959 13.2366 23 12 23H4.61803C3.87465 23 3.39116 22.2177 3.72361 21.5528L4.48405 20.0319C2.3399 18.0247 1 15.1688 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12C23 13.2366 22.7959 14.4256 22.4196 15.5351C22.2832 15.512 22.143 15.5 22 15.5H20.5V14.9655C20.8239 14.0369 21 13.039 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 14.5928 4.09379 16.9269 5.85088 18.5718L6.94025 19.5916Z"/><path d="M8 8C7.44772 8 7 8.44772 7 9 7 9.55229 7.44772 10 8 10H15C15.5523 10 16 9.55229 16 9 16 8.44772 15.5523 8 15 8H8zM7 14C7 13.4477 7.44772 13 8 13H12C12.5523 13 13 13.4477 13 14 13 14.5523 12.5523 15 12 15H8C7.44772 15 7 14.5523 7 14zM18 13C18.5523 13 19 13.4477 19 14V17H22C22.5523 17 23 17.4477 23 18 23 18.5523 22.5523 19 22 19H19V22C19 22.5523 18.5523 23 18 23 17.4477 23 17 22.5523 17 22V19H14C13.4477 19 13 18.5523 13 18 13 17.4477 13.4477 17 14 17H17V14C17 13.4477 17.4477 13 18 13z"/></svg>;
}

const IconCozChatPlus = React.forwardRef(IconCozChatPlusComponent);
export default IconCozChatPlus;
