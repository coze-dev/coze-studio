import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozDesktopSlashFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_desktop_slash_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M15.4766 18.0001H13V20.0001H17C17.5523 20.0001 18 20.4478 18 21.0001C17.9997 21.5521 17.5521 22.0001 17 22.0001H7C6.44789 22.0001 6.00029 21.5521 6 21.0001C6 20.4478 6.44772 20.0001 7 20.0001H11V18.0001H3C1.89561 18.0001 1.00029 17.1044 1 16.0001V4.00009C1 3.85272 1.01663 3.70869 1.04688 3.5704L15.4766 18.0001ZM2.20508 1.19247C2.59551 0.802041 3.22859 0.802229 3.61914 1.19247L22.7119 20.2843C23.1021 20.6747 23.102 21.3079 22.7119 21.6983C22.3214 22.0887 21.6874 22.0887 21.2969 21.6983L2.20508 2.60653C1.81491 2.21606 1.81487 1.58292 2.20508 1.19247ZM21 2.00009C22.1046 2.00009 23 2.89552 23 4.00009V16.0001C22.9998 16.6674 22.6714 17.257 22.1689 17.6202L6.54883 2.00009H21Z"/></svg>;
}

const IconCozDesktopSlashFill = React.forwardRef(IconCozDesktopSlashFillComponent);
export default IconCozDesktopSlashFill;
