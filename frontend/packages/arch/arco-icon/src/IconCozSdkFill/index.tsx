import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozSdkFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_sdk_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M2 4C2 2.89543 2.89543 2 4 2H11C12.1046 2 13 2.89543 13 4V4.5H15V4C15 2.89543 15.8954 2 17 2H20C21.1046 2 22 2.89543 22 4V11C22 12.1046 21.1046 13 20 13H19.5V15H20C21.1046 15 22 15.8954 22 17V20C22 21.1046 21.1046 22 20 22H13C11.8954 22 11 21.1046 11 20V19.5H9V20C9 21.1046 8.10457 22 7 22H4C2.89543 22 2 21.1046 2 20V13C2 11.8954 2.89543 11 4 11H4.5V9H4C2.89543 9 2 8.10457 2 7V4ZM9 17.5L9 13C9 11.8954 8.10457 11 7 11H6.5V9H11C12.1046 9 13 8.10457 13 7V6.5H15V11C15 12.1046 15.8954 13 17 13H17.5V15L13 15C11.8954 15 11 15.8954 11 17V17.5H9Z"/></svg>;
}

const IconCozSdkFill = React.forwardRef(IconCozSdkFillComponent);
export default IconCozSdkFill;
