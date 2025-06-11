import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozVideoCameraFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_video_camera_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M15 4.00012C16.1046 4.00012 17 4.89555 17 6.00012V8.74915L21.4697 5.95618C22.1358 5.5399 23 6.01937 23 6.80481V17.1954C22.9999 17.9808 22.1357 18.4603 21.4697 18.0441L17 15.2501V18.0001C16.9999 19.1046 16.1045 20.0001 15 20.0001H3C1.89547 20.0001 1.00007 19.1046 1 18.0001V6.00012C1 4.89555 1.89543 4.00012 3 4.00012H15ZM4.5 10.5001H7.5V7.50012H4.5V10.5001Z"/></svg>;
}

const IconCozVideoCameraFill = React.forwardRef(IconCozVideoCameraFillComponent);
export default IconCozVideoCameraFill;
