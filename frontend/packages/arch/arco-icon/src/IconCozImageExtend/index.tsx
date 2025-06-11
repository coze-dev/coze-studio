import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozImageExtendComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_image_extend${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M3 15.5C3.55228 15.5 4 15.9477 4 16.5V18.5137L6.01367 16.5C6.40421 16.1096 7.03726 16.1095 7.42773 16.5C7.81813 16.8905 7.81808 17.5236 7.42773 17.9141L5.3418 20H7.5C8.05229 20 8.5 20.4477 8.5 21C8.5 21.5523 8.05228 22 7.5 22H4C2.89543 22 2 21.1046 2 20V16.5C2 15.9477 2.44772 15.5 3 15.5ZM21 15.5C21.5523 15.5 22 15.9477 22 16.5V20C22 21.1046 21.1046 22 20 22H16.5C15.9477 22 15.5 21.5523 15.5 21C15.5 20.4477 15.9477 20 16.5 20H18.6582L16.5723 17.9141C16.1819 17.5236 16.1819 16.8905 16.5723 16.5C16.9627 16.1095 17.5958 16.1096 17.9863 16.5L20 18.5137V16.5C20 15.9477 20.4477 15.5 21 15.5ZM14.5 8.5C15.0523 8.5 15.5 8.94772 15.5 9.5V14.5C15.5 15.0523 15.0523 15.5 14.5 15.5H9.5C8.94772 15.5 8.5 15.0523 8.5 14.5V9.5C8.5 8.94772 8.94772 8.5 9.5 8.5H14.5ZM7.5 2C8.05228 2 8.5 2.44772 8.5 3C8.5 3.55228 8.05229 4 7.5 4H5.3418L7.42773 6.08594C7.81808 6.47645 7.81813 7.10952 7.42773 7.5C7.03726 7.89047 6.40421 7.89037 6.01367 7.5L4 5.48633V7.5C4 8.05228 3.55228 8.5 3 8.5C2.44772 8.5 2 8.05228 2 7.5V4C2 2.89543 2.89543 2 4 2H7.5ZM20 2C21.1046 2 22 2.89543 22 4V7.5C22 8.05228 21.5523 8.5 21 8.5C20.4477 8.5 20 8.05228 20 7.5V5.48633L17.9863 7.5C17.5958 7.89037 16.9627 7.89047 16.5723 7.5C16.1819 7.10952 16.1819 6.47645 16.5723 6.08594L18.6582 4H16.5C15.9477 4 15.5 3.55228 15.5 3C15.5 2.44772 15.9477 2 16.5 2H20Z"/></svg>;
}

const IconCozImageExtend = React.forwardRef(IconCozImageExtendComponent);
export default IconCozImageExtend;
