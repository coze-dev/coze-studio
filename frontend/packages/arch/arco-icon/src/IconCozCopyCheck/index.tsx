import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozCopyCheckComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_copy_check${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M10 2C9.44772 2 9 2.44772 9 3 9 3.55228 9.44771 4 10 4H19V15C19 15.5523 19.4477 16 20 16 20.5523 16 21 15.5523 21 15V3C21 2.44772 20.5523 2 20 2H10zM14.0209 12.6849C14.2161 12.4897 14.2161 12.1731 14.0209 11.9778L13.3138 11.2707C13.1185 11.0755 12.8019 11.0755 12.6066 11.2707L8.93015 14.9472 7.69157 13.7087C7.4963 13.5135 7.17972 13.5135 6.98446 13.7087L6.27737 14.4159C6.08212 14.6111 6.08212 14.9277 6.27739 15.123L8.57663 17.4221C8.77189 17.6173 9.08847 17.6173 9.28373 17.4221L14.0209 12.6849z"/><path fillRule="evenodd" clipRule="evenodd" d="M3 8C3 6.89543 3.89543 6 5 6H15C16.1046 6 17 6.89543 17 8V20C17 21.1046 16.1046 22 15 22H5C3.89543 22 3 21.1046 3 20V8ZM15 20V8H5L5 20H15Z"/></svg>;
}

const IconCozCopyCheck = React.forwardRef(IconCozCopyCheckComponent);
export default IconCozCopyCheck;
