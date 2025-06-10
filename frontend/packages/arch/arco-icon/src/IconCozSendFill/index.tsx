import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozSendFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_send_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M21.4159 13.3153C21.8961 13.0536 22.1965 12.5506 22.1965 11.9998C22.1965 11.449 21.8961 10.9483 21.4159 10.6865L3.99982 1.25701C3.53551 1.00437 2.98699 1.01575 2.53179 1.2866C2.07659 1.55744 1.80347 2.03768 1.80347 2.57027L3.725 10.0755L11.8947 11.2715C12.363 11.2715 12.7414 11.5969 12.7414 11.9998C12.7414 12.4026 12.363 12.7281 11.8947 12.7281C7.2906 13.4031 4.56846 13.799 3.72825 13.9159L1.80347 21.4293C1.80347 21.9619 2.07659 22.4421 2.53179 22.7153C2.98699 22.9861 3.53551 22.9975 3.99982 22.7448L21.4159 13.3153Z"/></svg>;
}

const IconCozSendFill = React.forwardRef(IconCozSendFillComponent);
export default IconCozSendFill;
