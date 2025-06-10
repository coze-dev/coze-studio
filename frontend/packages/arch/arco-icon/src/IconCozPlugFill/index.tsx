import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozPlugFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_plug_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M21.6831 4.08475C23.6787 6.67727 23.4889 10.4106 21.1134 12.786 20.3758 13.5237 19.1798 13.5237 18.4422 12.786L11.214 5.55784C10.4763 4.82018 10.4763 3.6242 11.214 2.88654 13.5894.511094 17.3228.321238 19.9153 2.31698L20.8389 1.39336C21.3271.905207 22.1186.905207 22.6067 1.39336 23.0949 1.88152 23.0949 2.67297 22.6067 3.16113L21.6831 4.08475zM9.3148 12.1439L11.8561 14.6852C11.911 14.5871 11.9801 14.495 12.0634 14.4116L13.8312 12.6438C14.3194 12.1557 15.1108 12.1557 15.599 12.6438 16.0871 13.132 16.0871 13.9234 15.599 14.4116L13.8312 16.1794C13.7479 16.2627 13.6557 16.3318 13.5577 16.3867L14.121 16.9501C14.9021 17.7311 14.9021 18.9975 14.121 19.7785L13.0604 20.8392C10.6284 23.2712 6.85212 23.5396 4.12343 21.6444L3.16123 22.6066C2.67307 23.0947 1.88162 23.0947 1.39346 22.6066.905305 22.1184.905305 21.327 1.39346 20.8388L2.35566 19.8766C.460489 17.1479.728888 13.3717 3.16086 10.9397L4.22152 9.87902C5.00257 9.09797 6.2689 9.09797 7.04995 9.87902L7.61323 10.4423C7.66812 10.3443 7.73724 10.2521 7.82058 10.1688L9.58835 8.40099C10.0765 7.91283 10.868 7.91283 11.3561 8.40099 11.8443 8.88914 11.8443 9.6806 11.3561 10.1688L9.58835 11.9365C9.505 12.0199 9.41281 12.089 9.3148 12.1439z"/></svg>;
}

const IconCozPlugFill = React.forwardRef(IconCozPlugFillComponent);
export default IconCozPlugFill;
