import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozCodeFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_code_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M11.1556 22.979C11.7038 23.0463 12.2028 22.6565 12.2701 22.1083L14.7074 2.25739C14.7748 1.70922 14.3849 1.21028 13.8368 1.14298L12.8442 1.02111C12.2961.9538 11.7971 1.34361 11.7298 1.89178L9.29242 21.7427C9.22512 22.2909 9.61493 22.7898 10.1631 22.8571L11.1556 22.979zM22.9949 13.4193L23 13.4142 23.7071 12.7071C23.9024 12.5119 24 12.2559 24 12 24 11.9605 23.9977 11.9209 23.993 11.8816 23.9675 11.6664 23.8722 11.458 23.7071 11.2929L23 10.5858 22.995 10.5808 18.7574 6.34317C18.3668 5.95265 17.7337 5.95265 17.3431 6.34317L16.636 7.05028C16.2455 7.4408 16.2455 8.07397 16.636 8.46449L20.1716 12 16.636 15.5355C16.2455 15.926 16.2455 16.5592 16.636 16.9497L17.3431 17.6568C17.7337 18.0474 18.3668 18.0474 18.7574 17.6568L22.9949 13.4193zM1 13.4142L1.00518 13.4194 5.24264 17.6568C5.63317 18.0474 6.26633 18.0474 6.65685 17.6568L7.36396 16.9497C7.75449 16.5592 7.75449 15.926 7.36396 15.5355L3.82845 12 7.36396 8.46449C7.75448 8.07397 7.75448 7.4408 7.36396 7.05028L6.65685 6.34317C6.26633 5.95265 5.63316 5.95265 5.24264 6.34317L1.00513 10.5807 1 10.5858.292893 11.2929C.0983892 11.4874.000759666 11.7421.0000045229 11.997-.000765805 12.2539.0968638 12.5111.292893 12.7071L1 13.4142z"/></svg>;
}

const IconCozCodeFill = React.forwardRef(IconCozCodeFillComponent);
export default IconCozCodeFill;
