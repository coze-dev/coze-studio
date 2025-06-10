import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozTableComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_table${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M2.00024 3.99988C2.00024 2.89531 2.89567 1.99988 4.00024 1.99988H20.0002C21.1048 1.99988 22.0002 2.89531 22.0002 3.99988V19.9999C22.0002 21.1044 21.1048 21.9999 20.0002 21.9999H4.00024C2.89568 21.9999 2.00024 21.1045 2.00024 19.9999V3.99988ZM9.50025 3.99988V7.99988L20.0002 7.99988V3.99988H9.50025ZM9.50025 9.99988V13.9999L20.0002 13.9999V9.99988L9.50025 9.99988ZM7.50024 13.9999V9.99988H4.00024V13.9999H7.50024ZM4.00024 15.9999V19.9999H7.50024V15.9999H4.00024ZM9.50025 15.9999V19.9999H20.0002V15.9999L9.50025 15.9999ZM7.50024 3.99988H4.00024V7.99988H7.50024V3.99988Z"/></svg>;
}

const IconCozTable = React.forwardRef(IconCozTableComponent);
export default IconCozTable;
