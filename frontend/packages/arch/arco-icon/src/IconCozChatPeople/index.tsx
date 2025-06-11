import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozChatPeopleComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_chat_people${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M6.94025 19.5916L6.23607 21H11.8414C11.6203 21.6256 11.5 22.2987 11.5 23H4.61803C3.87465 23 3.39116 22.2177 3.72361 21.5528L4.48405 20.0319C2.3399 18.0247 1 15.1688 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12C23 12.8236 22.9095 13.6261 22.7379 14.398C22.4116 13.4326 21.7985 12.5994 21 11.9996C20.9998 7.02924 16.9704 3 12 3C7.02944 3 3 7.02944 3 12C3 14.5928 4.09379 16.9269 5.85088 18.5718L6.94025 19.5916Z"/><path d="M7 9C7 8.44772 7.44772 8 8 8H15C15.5523 8 16 8.44772 16 9 16 9.55229 15.5523 10 15 10H8C7.44772 10 7 9.55229 7 9zM8 13C7.44772 13 7 13.4477 7 14 7 14.5523 7.44772 15 8 15H11C11.5523 15 12 14.5523 12 14 12 13.4477 11.5523 13 11 13H8z"/><path fillRule="evenodd" clipRule="evenodd" d="M15 23C15 21.6193 16.1193 20.5 17.5 20.5H18.5C19.8807 20.5 21 21.6193 21 23H23C23 21.0807 21.7985 19.4421 20.1066 18.7953C20.953 18.1564 21.5 17.1421 21.5 16C21.5 14.067 19.933 12.5 18 12.5C16.067 12.5 14.5 14.067 14.5 16C14.5 17.1421 15.047 18.1564 15.8934 18.7953C14.2015 19.4421 13 21.0807 13 23H15ZM19.5 16C19.5 16.8284 18.8284 17.5 18 17.5C17.1716 17.5 16.5 16.8284 16.5 16C16.5 15.1716 17.1716 14.5 18 14.5C18.8284 14.5 19.5 15.1716 19.5 16Z"/></svg>;
}

const IconCozChatPeople = React.forwardRef(IconCozChatPeopleComponent);
export default IconCozChatPeople;
