import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozStarFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_star_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M10.7399 1.95135C11.3308 1.03632 12.6692 1.03632 13.2601 1.95135L16.123 6.38477C16.257 6.59229 16.4631 6.74287 16.7016 6.80748L21.7887 8.186C22.8322 8.46876 23.2429 9.72905 22.5665 10.5724L19.2461 14.7118C19.0927 14.9029 19.0149 15.1438 19.0274 15.3885L19.2985 20.6923C19.3539 21.7771 18.2739 22.5593 17.2606 22.1684L12.3599 20.278C12.1283 20.1886 11.8717 20.1886 11.6401 20.278L6.73943 22.1684C5.72608 22.5593 4.6461 21.7771 4.70153 20.6923L4.97259 15.3885C4.9851 15.1438 4.90729 14.9029 4.75395 14.7118L1.43355 10.5724C0.757097 9.72905 1.16785 8.46876 2.21131 8.186L7.29847 6.80748C7.5369 6.74287 7.74298 6.59229 7.87699 6.38477L10.7399 1.95135Z"/></svg>;
}

const IconCozStarFill = React.forwardRef(IconCozStarFillComponent);
export default IconCozStarFill;
