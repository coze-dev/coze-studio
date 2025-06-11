import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozTagComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_tag${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M14.2832 9.79136C14.999 10.5072 16.1596 10.5072 16.8755 9.79136C17.5913 9.07551 17.5913 7.91489 16.8755 7.19904C16.1596 6.48319 14.999 6.48319 14.2832 7.19904C13.5673 7.91489 13.5673 9.07551 14.2832 9.79136Z"/><path d="M22.0746 4.00001C22.0746 2.89544 21.1792 2.00001 20.0746 2.00001L13.2619 2C12.4663 2 11.7032 2.31607 11.1406 2.87868L2.24691 11.7724C1.46587 12.5535 1.46587 13.8198 2.24692 14.6009L9.47376 21.8277C10.2548 22.6088 11.5211 22.6088 12.3022 21.8277L21.1959 12.934C21.7585 12.3714 22.0746 11.6083 22.0746 10.8126L22.0746 4.00001ZM20.0746 4.00001L20.0746 10.8127C20.0746 11.0779 19.9692 11.3322 19.7817 11.5198L10.8268 20.4747L3.59995 13.2478L12.5548 4.29289C12.7424 4.10536 12.9967 4 13.2619 4L20.0746 4.00001Z"/></svg>;
}

const IconCozTag = React.forwardRef(IconCozTagComponent);
export default IconCozTag;
