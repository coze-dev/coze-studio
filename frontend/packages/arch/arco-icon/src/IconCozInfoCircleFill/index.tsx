import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozInfoCircleFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_info_circle_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M1 12C1 18.075 5.925 23 12 23C18.075 23 23 18.075 23 12C23 5.92497 18.075 0.999969 12 0.999969C5.925 0.999969 1 5.92497 1 12ZM11 11.5V15.5H10.5C9.94772 15.5 9.5 15.9477 9.5 16.5C9.5 17.0523 9.94772 17.5 10.5 17.5H13.5C14.0523 17.5 14.5 17.0523 14.5 16.5C14.5 15.9477 14.0523 15.5 13.5 15.5H13C13 14.8333 13.0008 14.1667 13.0016 13.5001C13.0028 12.4988 13.004 11.4976 13.0025 10.4964C13.0017 9.94549 12.5545 9.49997 12.0036 9.49997H11C10.4477 9.49997 10 9.94769 10 10.5C10 11.0523 10.4477 11.5 11 11.5ZM11 7.49997C11 8.05225 11.4477 8.49997 12 8.49997C12.5523 8.49997 13 8.05225 13 7.49997C13 6.94768 12.5523 6.49997 12 6.49997C11.4477 6.49997 11 6.94768 11 7.49997Z"/></svg>;
}

const IconCozInfoCircleFill = React.forwardRef(IconCozInfoCircleFillComponent);
export default IconCozInfoCircleFill;
