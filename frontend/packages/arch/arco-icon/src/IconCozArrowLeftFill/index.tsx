import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozArrowLeftFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_arrow_left_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 25 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M7.29297 10.5806C7.29126 10.5823 7.28955 10.5839 7.28784 10.5857L6.58074 11.2928C6.40988 11.4636 6.31378 11.6809 6.29242 11.904C6.28241 12.0086 6.28882 12.1144 6.31166 12.2174C6.35145 12.3968 6.44114 12.5674 6.58074 12.707L7.28784 13.4141C7.28953 13.4158 7.29122 13.4175 7.29291 13.4191L13.6518 19.778C14.0423 20.1686 14.6755 20.1686 15.066 19.778L15.7731 19.0709C16.1636 18.6804 16.1636 18.0472 15.7731 17.6567L10.1163 11.9999L15.7731 6.34305C16.1636 5.95252 16.1636 5.31936 15.7731 4.92883L15.066 4.22173C14.6755 3.8312 14.0423 3.8312 13.6518 4.22173L7.29297 10.5806Z"/></svg>;
}

const IconCozArrowLeftFill = React.forwardRef(IconCozArrowLeftFillComponent);
export default IconCozArrowLeftFill;
