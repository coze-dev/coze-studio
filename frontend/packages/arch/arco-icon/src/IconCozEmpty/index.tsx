import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozEmptyComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_empty${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M11 5.5V2.5H13V5.5H11ZM7.207 3.293L9.207 5.293L7.793 6.707L5.793 4.707L7.207 3.293ZM18.207 4.707L16.207 6.707L14.793 5.293L16.793 3.293L18.207 4.707ZM5.347 8.992C5.52316 8.69012 5.77535 8.43967 6.07845 8.26562C6.38156 8.09157 6.72498 7.99998 7.0745 8H16.925C17.2746 8.00004 17.618 8.09169 17.9211 8.26584C18.2242 8.43998 18.4764 8.69053 18.6525 8.9925L21.7275 14.2625C21.906 14.5684 22 14.9163 22 15.2705V19.5C22 19.7626 21.9483 20.0227 21.8478 20.2654C21.7472 20.508 21.5999 20.7285 21.4142 20.9142C21.2285 21.0999 21.008 21.2472 20.7654 21.3478C20.5227 21.4483 20.2626 21.5 20 21.5H4C3.73736 21.5 3.47728 21.4483 3.23463 21.3478C2.99198 21.2472 2.7715 21.0999 2.58579 20.9142C2.40007 20.7285 2.25275 20.508 2.15224 20.2654C2.05173 20.0227 2 19.7626 2 19.5V15.27C2.00006 14.916 2.0941 14.5683 2.2725 14.2625L5.347 8.992ZM16.925 10H7.075L4.7415 14H10.7215L10.9465 14.675C10.9615 14.7131 10.9782 14.7504 10.9965 14.787C11.0415 14.877 11.1115 14.9955 11.2065 15.11C11.39 15.3305 11.6315 15.5 12.0005 15.5C12.3695 15.5 12.6105 15.3305 12.795 15.11C12.9024 14.9795 12.9897 14.8337 13.054 14.6775L13.0545 14.675L13.2795 14H19.2595L16.925 10ZM20 16H14.6135C14.5279 16.1361 14.4334 16.2664 14.3305 16.39C13.89 16.92 13.131 17.5 12 17.5C10.869 17.5 10.11 16.9195 9.6695 16.39C9.56662 16.2664 9.47208 16.1361 9.3865 16H4V19.5H20V16Z"/></svg>;
}

const IconCozEmpty = React.forwardRef(IconCozEmptyComponent);
export default IconCozEmpty;
