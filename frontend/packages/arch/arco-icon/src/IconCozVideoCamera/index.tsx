import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozVideoCameraComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_video_camera${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M15 4.00012C16.1046 4.00012 17 4.89555 17 6.00012V8.74915L21.4697 5.95618C22.1358 5.5399 23 6.01937 23 6.80481V17.1954L22.9902 17.339C22.8995 17.991 22.1976 18.38 21.5967 18.1115L21.4697 18.0441L17 15.2501V18.0001C16.9999 19.1046 16.1045 20.0001 15 20.0001H3L2.7959 19.9894C1.78726 19.8871 1.00006 19.0357 1 18.0001V6.00012C1 4.96448 1.78723 4.11313 2.7959 4.01086L3 4.00012H15ZM3 18.0001H15V6.00012H3V18.0001ZM17 11.1085V12.8907L21 15.3907V8.60852L17 11.1085ZM7.5 10.5001H5V8.00012H7.5V10.5001Z"/></svg>;
}

const IconCozVideoCamera = React.forwardRef(IconCozVideoCameraComponent);
export default IconCozVideoCamera;
