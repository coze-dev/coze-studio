import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozPinSlashComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_pin_slash${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M2.20549 1.19292C1.81497 1.58344 1.81497 2.21661 2.20549 2.60713L21.2974 21.699C21.6879 22.0895 22.3211 22.0895 22.7116 21.699 23.1021 21.3085 23.1021 20.6753 22.7116 20.2848L3.6197 1.19292C3.22918.802393 2.59601.802393 2.20549 1.19292zM3.56105 8.24824L5.58603 8.109 7.49486 10.0178 5.23887 10.1719 13.5084 18.4464 13.6698 16.1927 15.514 18.037 15.3724 20.0575C15.3724 20.1925 15.3189 20.3225 15.2239 20.4175L14.6547 20.9852C14.2595 21.3819 13.6217 21.3833 13.2328 20.9944L8.64908 16.4143 3.98437 21.0787C3.59384 21.4692 2.96069 21.4692 2.57018 21.0787L2.55532 21.0638C2.16507 20.6736 2.16475 20.0409 2.55459 19.6503L7.21613 14.9793 2.63318 10.3949C2.22774 9.98948 2.23867 9.36107 2.63465 8.96509L3.2028 8.39824C3.29785 8.30324 3.4267 8.24824 3.56105 8.24824zM17.7536 8.78222L15.5442 10.9961 16.9268 12.3787 19.1352 10.1711 20.3335 11.3622C20.8355 11.8641 21.4844 11.6596 21.7507 11.3934 22.1865 10.9575 22.1296 10.3298 21.7478 9.94796L13.6938 1.89401C13.2521 1.45229 12.633 1.50984 12.243 1.89986 11.8651 2.27772 11.8993 2.93216 12.2796 3.30823L13.4738 4.50668 11.2641 6.71601 12.7115 8.16345 14.9203 5.9521 17.7536 8.78222z"/></svg>;
}

const IconCozPinSlash = React.forwardRef(IconCozPinSlashComponent);
export default IconCozPinSlash;
