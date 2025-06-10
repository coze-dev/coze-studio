import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozArrowDownFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_arrow_down_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 25 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M10.7574 16.8839C10.7591 16.8857 10.7608 16.8874 10.7625 16.8891L11.4696 17.5962C11.6405 17.767 11.8578 17.8631 12.0809 17.8845C12.1855 17.8945 12.2913 17.8881 12.3943 17.8653C12.5737 17.8255 12.7443 17.7358 12.8839 17.5962L13.591 16.8891C13.5927 16.8874 13.5944 16.8857 13.596 16.884L19.9549 10.5251C20.3454 10.1346 20.3454 9.50143 19.9549 9.1109L19.2478 8.4038C18.8573 8.01327 18.2241 8.01327 17.8336 8.4038L12.1768 14.0606L6.51993 8.40379C6.1294 8.01327 5.49624 8.01327 5.10571 8.40379L4.39861 9.1109C4.00808 9.50142 4.00808 10.1346 4.39861 10.5251L10.7574 16.8839Z"/></svg>;
}

const IconCozArrowDownFill = React.forwardRef(IconCozArrowDownFillComponent);
export default IconCozArrowDownFill;
