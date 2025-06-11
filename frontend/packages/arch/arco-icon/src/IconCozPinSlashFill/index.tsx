import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozPinSlashFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_pin_slash_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M2.20573 1.19295C1.81521 1.58347 1.81521 2.21664 2.20574 2.60716L21.2976 21.699C21.6881 22.0896 22.3213 22.0896 22.7118 21.699 23.1024 21.3085 23.1024 20.6754 22.7118 20.2848L3.61995 1.19295C3.22942.802424 2.59626.802424 2.20573 1.19295zM3.56129 8.34826L5.67982 8.20258 15.5208 18.0435 15.3726 20.1575C15.3726 20.2925 15.3191 20.4225 15.2241 20.5175L14.655 21.0852C14.2597 21.4819 13.6219 21.4833 13.233 21.0944L8.64933 16.5143 3.98461 21.1787C3.59408 21.5692 2.96094 21.5692 2.57042 21.1787L2.55556 21.1638C2.16532 20.7736 2.16499 20.141 2.55484 19.7503L7.21638 15.0793 2.63342 10.4949C2.22799 10.0895 2.23891 9.46109 2.63489 9.06511L3.20305 8.49826C3.2981 8.40326 3.42695 8.34826 3.56129 8.34826zM19.1354 10.2711L16.9771 12.4288 11.3143 6.76604 13.474 4.60669 12.2798 3.40824C11.8995 3.03218 11.8654 2.37774 12.2432 1.99988 12.6332 1.60986 13.2523 1.55231 13.6941 1.99403L21.748 10.048C22.1298 10.4298 22.1868 11.0575 21.7509 11.4934 21.4847 11.7596 20.8357 11.9642 20.3338 11.4622L19.1354 10.2711z"/></svg>;
}

const IconCozPinSlashFill = React.forwardRef(IconCozPinSlashFillComponent);
export default IconCozPinSlashFill;
