import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozWalletFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_wallet_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M1.1495 4.97843C1.15162 3.88216 2.04047 3 3.13674 3H20.8633C21.9596 3 22.8484 3.88216 22.8505 4.97842C22.8575 8.59106 22.8497 15.5781 22.845 19.0056C22.8435 20.1089 21.9487 21 20.8453 21H3.1547C2.05139 21 1.15651 20.1089 1.15502 19.0056C1.15039 15.5781 1.14251 8.59106 1.1495 4.97843ZM16.5 7.5C14.0147 7.5 12 9.51472 12 12C12 14.4853 14.0147 16.5 16.5 16.5H21V14.5H16.5C15.1193 14.5 14 13.3807 14 12C14 10.6193 15.1193 9.5 16.5 9.5H21V7.5H16.5ZM16.5 13C17.0523 13 17.5 12.5523 17.5 12C17.5 11.4477 17.0523 11 16.5 11C15.9477 11 15.5 11.4477 15.5 12C15.5 12.5523 15.9477 13 16.5 13Z"/></svg>;
}

const IconCozWalletFill = React.forwardRef(IconCozWalletFillComponent);
export default IconCozWalletFill;
