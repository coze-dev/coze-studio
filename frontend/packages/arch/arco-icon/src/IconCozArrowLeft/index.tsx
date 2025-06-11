import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozArrowLeftComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_arrow_left${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 25 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M14.0053 4.22185L6.93425 11.2929C6.54373 11.6834 6.54373 12.3166 6.93425 12.7071L14.0053 19.7782C14.3958 20.1687 15.029 20.1687 15.4195 19.7782C15.8101 19.3877 15.8101 18.7545 15.4195 18.364L9.05557 12L15.4195 5.63606C15.8101 5.24554 15.8101 4.61237 15.4195 4.22185C15.029 3.83132 14.3958 3.83132 14.0053 4.22185Z"/></svg>;
}

const IconCozArrowLeft = React.forwardRef(IconCozArrowLeftComponent);
export default IconCozArrowLeft;
