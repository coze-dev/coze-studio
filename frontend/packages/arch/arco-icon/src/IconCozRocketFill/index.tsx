import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozRocketFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_rocket_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M21.3625 8.06251C22.0709 6.15418 22.2667 4.19168 21.95 2.17501C19.9334 1.85835 17.975 2.05835 16.075 2.77501C14.175 3.49168 12.3584 4.71668 10.625 6.45001L8.15005 5.95001C7.81672 5.88335 7.48755 5.90001 7.16255 6.00001C6.83755 6.10001 6.55838 6.26668 6.32505 6.50001L2.15005 10.7L7.07505 12.8L11.35 17.075L13.45 22L17.65 17.8C17.8834 17.5667 18.05 17.2917 18.15 16.975C18.25 16.6583 18.2667 16.3333 18.2 16L17.7 13.525C19.4334 11.7917 20.6542 9.97085 21.3625 8.06251ZM13.075 9.06251C13.075 9.62085 13.2666 10.0917 13.65 10.475C14.0333 10.8583 14.5083 11.05 15.075 11.05C15.6416 11.05 16.1166 10.8583 16.5 10.475C16.8833 10.0917 17.075 9.62085 17.075 9.06251C17.075 8.50418 16.8833 8.03335 16.5 7.65001C16.1166 7.26668 15.6416 7.07501 15.075 7.07501C14.5083 7.07501 14.0333 7.26668 13.65 7.65001C13.2666 8.03335 13.075 8.50418 13.075 9.06251Z"/><path d="M6.06255 15.0875C5.22088 15.0958 4.50838 15.3917 3.92505 15.975C3.50838 16.3917 3.15005 17.0875 2.85005 18.0625C2.55005 19.0375 2.28338 20.3833 2.05005 22.1C3.76672 21.8667 5.11255 21.6 6.08755 21.3C7.06255 21 7.75838 20.6417 8.17505 20.225C8.75838 19.6417 9.05422 18.9292 9.06255 18.0875C9.07088 17.2458 8.78338 16.5333 8.20005 15.95C7.61672 15.3667 6.90422 15.0792 6.06255 15.0875Z"/></svg>;
}

const IconCozRocketFill = React.forwardRef(IconCozRocketFillComponent);
export default IconCozRocketFill;
