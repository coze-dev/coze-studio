import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozVideoCameraSlashFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_video_camera_slash_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M1.74707 1.7471C2.1376 1.35661 2.77062 1.35659 3.16113 1.7471L22.2529 20.8389C22.6434 21.2294 22.6434 21.8624 22.2529 22.253C21.8624 22.6434 21.2294 22.6434 20.8389 22.253L1.74707 3.16117C1.35656 2.77065 1.35658 2.13763 1.74707 1.7471ZM4.5 8.03519V10.5H6.96484L16.1201 19.6553C15.8004 19.8721 15.4154 20 15 20H3C1.89549 20 1.0001 19.1045 1 18V6.00003C1 5.58459 1.12692 5.1987 1.34375 4.87894L4.5 8.03519ZM15 4.00003C16.1046 4.00003 17 4.89546 17 6.00003V8.74906L21.4697 5.95609C22.1358 5.53981 23 6.01929 23 6.80472V17.1953C22.9999 17.9023 22.3004 18.3588 21.6748 18.1397L7.53516 4.00003H15Z"/></svg>;
}

const IconCozVideoCameraSlashFill = React.forwardRef(IconCozVideoCameraSlashFillComponent);
export default IconCozVideoCameraSlashFill;
