import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozLessComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_less${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 25 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M4.4195 11.589C4.46847 11.4801 4.53714 11.3794 4.62394 11.2927C4.69063 11.2259 4.76562 11.1699 4.84624 11.1253L16.5226 4.38393C17.0009 4.10779 17.6124 4.27166 17.8886 4.74995C18.1647 5.22825 18.0009 5.83984 17.5226 6.11598L7.33122 12L17.5226 17.8839C18.0009 18.1601 18.1647 18.7717 17.8886 19.25C17.6124 19.7282 17.0009 19.8921 16.5226 19.616L4.84622 12.8746C4.76561 12.83 4.69062 12.774 4.62394 12.7072C4.53714 12.6205 4.46846 12.5198 4.41949 12.4109C4.35959 12.2785 4.33093 12.1384 4.33106 12C4.33093 11.8615 4.35959 11.7214 4.4195 11.589Z"/></svg>;
}

const IconCozLess = React.forwardRef(IconCozLessComponent);
export default IconCozLess;
