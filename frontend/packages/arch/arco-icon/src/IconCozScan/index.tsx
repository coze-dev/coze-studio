import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozScanComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_scan${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M2 4C2 2.89543 2.89543 2 4 2H8C8.55228 2 9 2.44772 9 3 9 3.55228 8.55228 4 8 4H4V8C4 8.55228 3.55228 9 3 9 2.44772 9 2 8.55228 2 8V4zM20 2C21.1046 2 22 2.89543 22 4V8C22 8.55228 21.5523 9 21 9 20.4477 9 20 8.55228 20 8V4L16 4C15.4477 4 15 3.55228 15 3 15 2.44772 15.4477 2 16 2H20zM20 22C21.1046 22 22 21.1046 22 20V16C22 15.4477 21.5523 15 21 15 20.4477 15 20 15.4477 20 16V20H16C15.4477 20 15 20.4477 15 21 15 21.5523 15.4477 22 16 22H20zM4 22C2.89543 22 2 21.1046 2 20V16C2 15.4477 2.44772 15 3 15 3.55228 15 4 15.4477 4 16L4 20H8C8.55228 20 9 20.4477 9 21 9 21.5523 8.55228 22 8 22H4zM3 11C2.44772 11 2 11.4477 2 12 2 12.5523 2.44772 13 3 13L21 13C21.5523 13 22 12.5523 22 12 22 11.4477 21.5523 11 21 11L3 11z"/></svg>;
}

const IconCozScan = React.forwardRef(IconCozScanComponent);
export default IconCozScan;
