import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozEnvelopeComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_envelope${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M5.5581 10.2145C5.05426 9.95139 4.87111 9.32155 5.15531 8.8293C5.42297 8.3657 6.00848 8.19544 6.48301 8.44323L11.9643 11.3054L17.4454 8.44334C17.9199 8.19555 18.5054 8.36581 18.7731 8.82942C19.0573 9.32166 18.8742 9.95151 18.3703 10.2146L12.4829 13.2889C12.3171 13.3754 12.1378 13.411 11.9632 13.4008C11.7892 13.4106 11.6106 13.375 11.4455 13.2887L5.5581 10.2145Z"/><path d="M21.0086 3C22.1131 2.99999 23 3.89543 23 5V19.0001C23 20.1047 22.1123 21.0001 21.0077 21.0001H2.99142C1.88685 21.0001 1 20.1047 1 19.0001V5.00009C1 3.89552 1.88769 3.00009 2.99226 3.00009L21.0086 3ZM21 5L3 5.00009V19.0001L21 19.0001V5Z"/></svg>;
}

const IconCozEnvelope = React.forwardRef(IconCozEnvelopeComponent);
export default IconCozEnvelope;
