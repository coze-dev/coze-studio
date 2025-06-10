import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozMoreComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_more${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M5.5 11.75C5.5 12.7165 4.7165 13.5 3.75 13.5 2.7835 13.5 2 12.7165 2 11.75 2 10.7835 2.7835 10 3.75 10 4.7165 10 5.5 10.7835 5.5 11.75zM13.7254 11.75C13.7254 12.7165 12.9419 13.5 11.9754 13.5 11.0089 13.5 10.2254 12.7165 10.2254 11.75 10.2254 10.7835 11.0089 10 11.9754 10 12.9419 10 13.7254 10.7835 13.7254 11.75zM22 11.75C22 12.7165 21.2165 13.5 20.25 13.5 19.2835 13.5 18.5 12.7165 18.5 11.75 18.5 10.7835 19.2835 10 20.25 10 21.2165 10 22 10.7835 22 11.75z"/></svg>;
}

const IconCozMore = React.forwardRef(IconCozMoreComponent);
export default IconCozMore;
