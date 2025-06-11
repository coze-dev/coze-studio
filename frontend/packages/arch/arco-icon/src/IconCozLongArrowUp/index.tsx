import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozLongArrowUpComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_long_arrow_up${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M11.8798 1.50717C11.6653 1.53299 11.4576 1.62822 11.2929 1.79286L4.22185 8.86393C3.83132 9.25446 3.83132 9.88762 4.22185 10.2781C4.61237 10.6687 5.24554 10.6687 5.63606 10.2781L11 4.91416L11 21.5C11 22.0523 11.4478 22.5 12 22.5C12.5523 22.5 13 22.0523 13 21.5L13 4.91418L18.364 10.2781C18.7545 10.6687 19.3877 10.6687 19.7782 10.2781C20.1688 9.88762 20.1688 9.25446 19.7782 8.86393L12.7072 1.79286C12.5607 1.64641 12.3801 1.55488 12.191 1.51828C12.0884 1.49842 11.9834 1.49472 11.8798 1.50717Z"/></svg>;
}

const IconCozLongArrowUp = React.forwardRef(IconCozLongArrowUpComponent);
export default IconCozLongArrowUp;
