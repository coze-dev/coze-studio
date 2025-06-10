import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozImageOverlayFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_image_overlay_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M5.82593 3.44267L11.0442 2.98175 8.33568 2.25601C7.30616 1.98015 6.25083 2.502 5.82593 3.44267zM20.6736 5.56195L21.5759 15.7774 23.514 8.54418C23.8207 7.39965 23.1415 6.22322 21.997 5.91654L20.6736 5.56195zM19.8875 21.0465C19.9138 21.0442 19.94 21.0414 19.966 21.0381 19.4476 21.6652 18.5933 21.9684 17.756 21.7441L16.3264 21.361 19.8875 21.0465zM6.85536 11.0689C7.71376 10.8389 8.22317 9.95658 7.99316 9.09818 7.76316 8.23978 6.88083 7.73037 6.02244 7.96038 5.16404 8.19039 4.65463 9.07271 4.88463 9.93111 5.11464 10.7895 5.99697 11.2989 6.85536 11.0689z"/><path fillRule="evenodd" clipRule="evenodd" d="M2.36905 4.54002C1.18875 4.64428 0.31643 5.68562 0.420683 6.86593L1.55328 19.6888C1.65754 20.8691 2.69888 21.7414 3.87919 21.6371L18.8391 20.3158C20.0195 20.2115 20.8918 19.1702 20.7875 17.9899L19.6549 5.16703C19.5507 3.98672 18.5093 3.1144 17.329 3.21866L2.36905 4.54002ZM17.5178 5.35579L2.55782 6.67716L3.48839 17.2127L5.91651 14.7343C6.22574 14.4186 6.70545 14.3434 7.09649 14.5491L9.6038 15.8684C9.99981 16.0768 10.486 15.9967 10.7943 15.6724L14.0647 12.2313C14.4074 11.8708 14.9629 11.8169 15.3685 12.1048L18.2976 14.1846L17.5178 5.35579Z"/></svg>;
}

const IconCozImageOverlayFill = React.forwardRef(IconCozImageOverlayFillComponent);
export default IconCozImageOverlayFill;
