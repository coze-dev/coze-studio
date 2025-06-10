import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozLongArrowLeftComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_long_arrow_left${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M14.1819 3.51471L6.40373 11.2929C6.01321 11.6834 6.01321 12.3166 6.40373 12.7071L14.1819 20.4853C14.5724 20.8758 15.2056 20.8758 15.5961 20.4853C15.9866 20.0947 15.9866 19.4616 15.5961 19.0711L8.52505 12L15.5961 4.92892C15.9866 4.5384 15.9866 3.90523 15.5961 3.51471C15.2056 3.12419 14.5724 3.12419 14.1819 3.51471Z"/></svg>;
}

const IconCozLongArrowLeft = React.forwardRef(IconCozLongArrowLeftComponent);
export default IconCozLongArrowLeft;
