import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozInputSlotComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_input_slot${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M13 1C12.4477 1 12 1.44772 12 2C12 2.55228 12.4477 3 13 3H15V21H13C12.4477 21 12 21.4477 12 22C12 22.5523 12.4477 23 13 23H19C19.5523 23 20 22.5523 20 22C20 21.4477 19.5523 21 19 21H17V19H19C21.2091 19 23 17.2091 23 15V9C23 6.79086 21.2091 5 19 5H17V3H19C19.5523 3 20 2.55228 20 2C20 1.44772 19.5523 1 19 1H13ZM17 7V17H19C20.1046 17 21 16.1046 21 15V9C21 7.89543 20.1046 7 19 7H17Z"/><path d="M6.7587 5L12.5 5C13.0523 5 13.5 5.44772 13.5 6C13.5 6.55228 13.0523 7 12.5 7H6.8C5.94342 7 5.36113 7.00078 4.91104 7.03755C4.47262 7.07337 4.24842 7.1383 4.09202 7.21799C3.7157 7.40973 3.40974 7.71569 3.21799 8.09202C3.1383 8.24842 3.07337 8.47262 3.03755 8.91104C3.00078 9.36113 3 9.94342 3 10.8V13.2C3 14.0566 3.00078 14.6389 3.03755 15.089C3.07337 15.5274 3.1383 15.7516 3.21799 15.908C3.40974 16.2843 3.7157 16.5903 4.09202 16.782C4.24842 16.8617 4.47262 16.9266 4.91104 16.9624C5.36113 16.9992 5.94342 17 6.8 17H12.5C13.0523 17 13.5 17.4477 13.5 18C13.5 18.5523 13.0523 19 12.5 19H6.75873C5.95374 19 5.28938 19 4.74818 18.9558C4.18608 18.9099 3.66937 18.8113 3.18404 18.564C2.43139 18.1805 1.81947 17.5686 1.43598 16.816C1.18868 16.3306 1.09012 15.8139 1.04419 15.2518C0.999978 14.7106 0.999988 14.0463 1 13.2413V10.7587C0.999988 9.95374 0.999978 9.28936 1.04419 8.74817C1.09012 8.18608 1.18868 7.66937 1.43598 7.18404C1.81947 6.43139 2.43139 5.81947 3.18404 5.43597C3.66937 5.18868 4.18608 5.09012 4.74818 5.04419C5.28937 4.99998 5.95373 4.99999 6.7587 5Z"/></svg>;
}

const IconCozInputSlot = React.forwardRef(IconCozInputSlotComponent);
export default IconCozInputSlot;
