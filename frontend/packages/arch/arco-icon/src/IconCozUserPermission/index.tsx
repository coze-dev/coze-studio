import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozUserPermissionComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_user_permission${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M16 7C16 9.76142 13.7614 12 11 12C8.23858 12 6 9.76142 6 7C6 4.23858 8.23858 2 11 2C13.7614 2 16 4.23858 16 7ZM14 7C14 8.65685 12.6569 10 11 10C9.34315 10 8 8.65685 8 7C8 5.34315 9.34315 4 11 4C12.6569 4 14 5.34315 14 7Z"/><path d="M4 19C4 16.7909 5.79086 15 8 15H14C15.6372 15 17.0446 15.9835 17.6637 17.392L19.1447 15.9109C18.0952 14.1668 16.1839 13 14 13H8C4.68629 13 2 15.6863 2 19V20C2 21.1046 2.89543 22 4 22H13.8733L12.4039 20.5306C12.2419 20.3686 12.1067 20.1899 11.9985 20H4L4 19Z"/><path d="M22.6568 15.9344C23.0473 16.3249 23.0473 16.9581 22.6568 17.3486L17.7162 22.2892L17.7072 22.2984C17.4669 22.5386 17.1348 22.6311 16.8238 22.5757C16.6293 22.5411 16.4431 22.4486 16.2929 22.2983L16.2852 22.2906L13.4645 19.4699C13.074 19.0794 13.074 18.4462 13.4645 18.0557C13.855 17.6652 14.4882 17.6652 14.8787 18.0557L17 20.177L21.2426 15.9344C21.6331 15.5438 22.2663 15.5438 22.6568 15.9344Z"/></svg>;
}

const IconCozUserPermission = React.forwardRef(IconCozUserPermissionComponent);
export default IconCozUserPermission;
