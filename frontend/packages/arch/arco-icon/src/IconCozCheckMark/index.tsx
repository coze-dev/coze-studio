import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozCheckMarkComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_check_mark${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 25 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M8.99488 17.8336L3.69157 12.5303C3.30105 12.1398 3.30105 11.5066 3.69157 11.1161C4.0821 10.7256 4.71526 10.7256 5.10579 11.1161L9.70198 15.7123L19.2479 6.16637C19.6384 5.77584 20.2716 5.77584 20.6621 6.16637C21.0527 6.55689 21.0527 7.19006 20.6621 7.58058L10.4091 17.8336C10.0186 18.2242 9.3854 18.2242 8.99488 17.8336Z"/></svg>;
}

const IconCozCheckMark = React.forwardRef(IconCozCheckMarkComponent);
export default IconCozCheckMark;
