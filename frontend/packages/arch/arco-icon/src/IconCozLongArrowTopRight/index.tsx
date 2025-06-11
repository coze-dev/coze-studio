import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozLongArrowTopRightComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_long_arrow_top_right${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M19.3345 4.49548C19.1646 4.36204 18.9503 4.28247 18.7175 4.28247H8.71749C8.16521 4.28247 7.71749 4.73019 7.71749 5.28247C7.71749 5.83476 8.16521 6.28247 8.71749 6.28247L16.3033 6.28247L4.57536 18.0104C4.18484 18.4009 4.18484 19.0341 4.57536 19.4246C4.96589 19.8152 5.59905 19.8152 5.98958 19.4246L17.7175 7.6967L17.7175 15.2825C17.7175 15.8348 18.1652 16.2825 18.7175 16.2825C19.2698 16.2825 19.7175 15.8348 19.7175 15.2825L19.7175 5.28249C19.7175 5.07538 19.6545 4.88297 19.5467 4.72336C19.4882 4.63679 19.4165 4.55986 19.3345 4.49548Z"/></svg>;
}

const IconCozLongArrowTopRight = React.forwardRef(IconCozLongArrowTopRightComponent);
export default IconCozLongArrowTopRight;
