import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozStrikethroughComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_strikethrough${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M5.49111 7.22566C5.52022 5.96498 6.01281 4.77641 6.90084 3.83144C8.01647 2.63571 9.71688 2 11.8177 2C13.9597 2 15.5971 2.5691 16.6849 3.68894C17.0853 4.08096 17.554 4.64705 17.9443 5.28358C18.3878 6.00676 17.7539 6.81359 16.9056 6.81359C16.2993 6.81359 15.8666 6.36661 15.5792 5.83281C15.4825 5.65303 15.3652 5.48809 15.2172 5.31615C14.4822 4.38569 13.3086 3.89734 11.8307 3.89734C9.42758 3.89734 7.67691 5.29229 7.63078 7.29028C7.61126 8.13564 7.96837 8.87015 8.62608 9.33333H5.87527C5.60506 8.71182 5.47321 8.00077 5.49111 7.22566ZM14.3958 13.25H4.03784C3.52005 13.25 3.10032 12.8709 3.10028 12.3531C3.10025 11.8354 3.51997 11.375 4.03771 11.375H20.1631C20.6808 11.375 21.1006 11.8115 21.1006 12.3293C21.1006 12.847 20.6808 13.25 20.1631 13.25H17.7083C18.2504 14.0565 18.6681 15.2041 18.6426 16.3055C18.5615 19.8196 15.8698 22 11.5721 22C8.69725 22 6.54382 21.0356 5.44289 19.2547C5.25119 18.9396 5.06352 18.5224 4.89718 18.0636C4.63615 17.3436 5.21545 16.6317 5.98133 16.6317C6.55495 16.6317 7.01534 17.0482 7.22075 17.5838C7.3915 18.029 7.62075 18.3784 7.9539 18.7257C8.75896 19.5843 10.0578 20.0305 11.7202 20.0305C14.5647 20.0305 16.4157 18.6413 16.4669 16.4212C16.4917 15.349 16.2113 14.8111 15.5703 14.0008C15.0975 13.403 14.3958 13.25 14.3958 13.25Z"/></svg>;
}

const IconCozStrikethrough = React.forwardRef(IconCozStrikethroughComponent);
export default IconCozStrikethrough;
