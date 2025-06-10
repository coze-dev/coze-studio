import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozChatSettingComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_chat_setting${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M6.94025 19.5916L6.23607 21H11.1841C11.427 21.8132 11.9611 22.5219 12.701 22.978C12.4692 22.9926 12.2355 23 12 23H4.61803C3.87465 23 3.39116 22.2177 3.72361 21.5528L4.48405 20.0319C2.3399 18.0247 1 15.1688 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12C23 12.2792 22.9896 12.5559 22.9692 12.8299L20.9948 11.69C20.8314 6.86296 16.8668 3 12 3C7.02944 3 3 7.02944 3 12C3 14.5928 4.09379 16.9269 5.85088 18.5718L6.94025 19.5916Z"/><path d="M8 8C7.44772 8 7 8.44772 7 9 7 9.55229 7.44772 10 8 10H15C15.5523 10 16 9.55229 16 9 16 8.44772 15.5523 8 15 8H8zM7 13C7 12.4477 7.44772 12 8 12H11C11.5523 12 12 12.4477 12 13 12 13.5523 11.5523 14 11 14H8C7.44772 14 7 13.5523 7 13zM19.5 17.9999C19.5 18.8284 18.8284 19.4999 18 19.4999 17.1716 19.4999 16.5 18.8284 16.5 17.9999 16.5 17.1715 17.1716 16.4999 18 16.4999 18.8284 16.4999 19.5 17.1715 19.5 17.9999z"/><path fillRule="evenodd" clipRule="evenodd" d="M19.0001 12.2726C18.3813 11.9153 17.6189 11.9153 17.0001 12.2726L13.54 14.2702C12.9212 14.6275 12.54 15.2878 12.54 16.0023V19.9976C12.54 20.7121 12.9212 21.3724 13.54 21.7296L17.0001 23.7273C17.6189 24.0845 18.3813 24.0845 19.0001 23.7273L22.4601 21.7296C23.0789 21.3724 23.4601 20.7121 23.4601 19.9976V16.0023C23.4601 15.2878 23.0789 14.6275 22.4601 14.2702L19.0001 12.2726ZM21.4601 16.0023L18.0001 14.0046L14.54 16.0023V19.9976L18.0001 21.9952L21.4601 19.9976V16.0023Z"/></svg>;
}

const IconCozChatSetting = React.forwardRef(IconCozChatSettingComponent);
export default IconCozChatSetting;
