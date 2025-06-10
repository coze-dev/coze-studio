import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozWalletComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_wallet${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M21 8V5H3.00002V19H21V16H17C14.7909 16 13 14.2091 13 12C13 9.79086 14.7909 8 17 8H21ZM1.1495 4.97843C1.15162 3.88216 2.04047 3 3.13674 3H20.8633C21.9596 3 22.8484 3.88216 22.8505 4.97842C22.8575 8.59106 22.8497 15.5781 22.845 19.0056C22.8435 20.1089 21.9487 21 20.8453 21H3.1547C2.05139 21 1.15651 20.1089 1.15502 19.0056C1.15039 15.5781 1.14251 8.59106 1.1495 4.97843ZM21 10H17C15.8954 10 15 10.8954 15 12C15 13.1046 15.8954 14 17 14H21V10ZM17 11C17.5523 11 18 11.4477 18 12C18 12.5523 17.5523 13 17 13C16.4477 13 16 12.5523 16 12C16 11.4477 16.4477 11 17 11Z"/></svg>;
}

const IconCozWallet = React.forwardRef(IconCozWalletComponent);
export default IconCozWallet;
