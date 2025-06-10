import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozScalingComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_scaling${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M14 3C14 2.44772 14.4477 2 15 2H20C21.1046 2 22 2.89543 22 4V9C22 9.55228 21.5523 10 21 10 20.4477 10 20 9.55228 20 9V5.48663L15.8022 9.6844C15.4117 10.0749 14.7785 10.0749 14.388 9.6844 13.9975 9.29388 13.9975 8.66071 14.388 8.27019L18.6582 4H15C14.4477 4 14 3.55228 14 3zM9.99219 21C9.99219 21.5523 9.54447 22 8.99219 22H3.99219C2.88762 22 1.99219 21.1046 1.99219 20V15C1.99219 14.4477 2.4399 14 2.99219 14 3.54447 14 3.99219 14.4477 3.99219 15V18.5134L8.18996 14.3156C8.58048 13.9251 9.21365 13.9251 9.60417 14.3156 9.9947 14.7061 9.9947 15.3393 9.60417 15.7298L5.33398 20H8.99219C9.54447 20 9.99219 20.4477 9.99219 21zM9 2C9.55228 2 10 2.44772 10 3 10 3.55228 9.55229 4 9 4H4V9C4 9.55228 3.55228 10 3 10 2.44772 10 2 9.55228 2 9V4C2 2.89543 2.89543 2 4 2H9zM13.9922 21C13.9922 21.5523 14.4399 22 14.9922 22H19.9922C21.0968 22 21.9922 21.1046 21.9922 20V15C21.9922 14.4477 21.5445 14 20.9922 14 20.4399 14 19.9922 14.4477 19.9922 15V20H14.9922C14.4399 20 13.9922 20.4477 13.9922 21z"/></svg>;
}

const IconCozScaling = React.forwardRef(IconCozScalingComponent);
export default IconCozScaling;
