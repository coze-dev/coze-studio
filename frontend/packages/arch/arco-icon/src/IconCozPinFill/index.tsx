import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozPinFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_pin_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M12.2433 1.99988C12.6333 1.60986 13.2524 1.55231 13.6941 1.99403L21.748 10.048C22.1299 10.4298 22.1868 11.0575 21.7509 11.4934C21.4847 11.7596 20.8358 11.9642 20.3338 11.4622L19.1354 10.2711L15.9343 13.4712C15.8393 13.5662 15.8144 13.7243 15.8144 13.8543L15.3726 20.1575C15.3726 20.2925 15.3191 20.4225 15.2241 20.5175L14.655 21.0852C14.2598 21.4819 13.6219 21.4833 13.233 21.0944L8.64936 16.5143L3.98464 21.1787C3.59411 21.5692 2.96096 21.5692 2.57045 21.1787L2.55559 21.1638C2.16535 20.7736 2.16502 20.141 2.55487 19.7503L7.21641 15.0793L2.63345 10.4949C2.22801 10.0895 2.23894 9.46109 2.63492 9.06511L3.20307 8.49826C3.29812 8.40326 3.42697 8.34826 3.56132 8.34826L9.87241 7.91429C10.0069 7.91429 10.1784 7.90182 10.2734 7.80682L13.4741 4.60669L12.2799 3.40824C11.8995 3.03218 11.8654 2.37774 12.2433 1.99988Z"/></svg>;
}

const IconCozPinFill = React.forwardRef(IconCozPinFillComponent);
export default IconCozPinFill;
