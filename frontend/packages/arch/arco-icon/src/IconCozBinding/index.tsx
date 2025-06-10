import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozBindingComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_binding${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M20 16C21.1046 16 22 15.1046 22 14V4C22 2.89543 21.1046 2 20 2H10C8.89543 2 8 2.89543 8 4V6C8 6.55229 8.44771 7 9 7C9.55229 7 10 6.55229 10 6V4H20V14H10V12C10 11.4477 9.55229 11 9 11C8.44771 11 8 11.4477 8 12V14.0001C8 15.1048 8.89557 16 10 16H20Z"/><path d="M4 8C2.89543 8 2 8.89543 2 10V20C2 21.1046 2.89543 22 4 22H14C15.1046 22 16 21.1046 16 20V18C16 17.4477 15.5523 17 15 17C14.4477 17 14 17.4477 14 18V20H4V10H14V12C14 12.5523 14.4477 13 15 13C15.5523 13 16 12.5523 16 12V10C16 8.89543 15.1046 8 14 8H4Z"/></svg>;
}

const IconCozBinding = React.forwardRef(IconCozBindingComponent);
export default IconCozBinding;
