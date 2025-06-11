import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozInfoCircleComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_info_circle${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M12 21C16.9705 21 21 16.9705 21 12C21 7.02947 16.9705 2.99997 12 2.99997C7.0295 2.99997 3 7.02947 3 12C3 16.9705 7.0295 21 12 21ZM12 23C5.925 23 1 18.075 1 12C1 5.92497 5.925 0.999969 12 0.999969C18.075 0.999969 23 5.92497 23 12C23 18.075 18.075 23 12 23ZM11 15.5V11.5C10.4477 11.5 10 11.0523 10 10.5C10 9.94768 10.4477 9.49997 11 9.49997H12.0036C12.5545 9.49997 13.0017 9.94549 13.0025 10.4964C13.005 12.1642 13 13.8321 13 15.5H13.5C14.0523 15.5 14.5 15.9477 14.5 16.5C14.5 17.0523 14.0523 17.5 13.5 17.5L10.5 17.5C9.94772 17.5 9.5 17.0523 9.5 16.5C9.5 15.9477 9.94772 15.5 10.5 15.5H11ZM12 8.49997C11.4477 8.49997 11 8.05225 11 7.49997C11 6.94768 11.4477 6.49997 12 6.49997C12.5523 6.49997 13 6.94768 13 7.49997C13 8.05225 12.5523 8.49997 12 8.49997Z"/></svg>;
}

const IconCozInfoCircle = React.forwardRef(IconCozInfoCircleComponent);
export default IconCozInfoCircle;
