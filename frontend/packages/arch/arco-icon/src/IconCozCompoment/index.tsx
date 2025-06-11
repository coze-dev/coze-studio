import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozCompomentComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_compoment${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M11.463 2.84164C11.7906 2.63319 12.2092 2.63319 12.5368 2.84164L21.6742 8.65633C22.2917 9.04928 22.2917 9.9507 21.6742 10.3437L12.5368 16.1583C12.2092 16.3668 11.7906 16.3668 11.463 16.1583L2.32567 10.3437C1.70817 9.9507 1.70817 9.04929 2.32567 8.65633L11.463 2.84164ZM4.72518 9.49999L11.9999 14.1294L19.2747 9.49999L11.9999 4.87061L4.72518 9.49999Z"/><path d="M3.50694 14.138C3.0309 13.858 2.418 14.0169 2.13798 14.4929C1.85796 14.9689 2.01686 15.5818 2.4929 15.8618L10.9859 20.8577C11.6118 21.2259 12.3881 21.2259 13.014 20.8577L21.5069 15.8618C21.983 15.5818 22.1419 14.9689 21.8619 14.4929C21.5818 14.0169 20.9689 13.858 20.4929 14.138L11.9999 19.1339L3.50694 14.138Z"/></svg>;
}

const IconCozCompoment = React.forwardRef(IconCozCompomentComponent);
export default IconCozCompoment;
