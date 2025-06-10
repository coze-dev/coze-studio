import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozBanComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_ban${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 16 16" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M0.667969 7.99984C0.667969 12.0499 3.95121 15.3332 8.0013 15.3332C12.0514 15.3332 15.3346 12.0499 15.3346 7.99984C15.3346 3.94975 12.0514 0.666504 8.0013 0.666504C3.95121 0.666504 0.667969 3.94975 0.667969 7.99984ZM11.7463 12.6879C10.7199 13.5089 9.41792 13.9998 8.0013 13.9998C4.68759 13.9998 2.0013 11.3135 2.0013 7.99984C2.0013 6.58322 2.49224 5.28127 3.31327 4.25484L11.7463 12.6879ZM12.6891 11.7451L4.25605 3.312C5.28252 2.49086 6.58457 1.99984 8.0013 1.99984C11.315 1.99984 14.0013 4.68613 14.0013 7.99984C14.0013 9.41657 13.5103 10.7186 12.6891 11.7451Z" fillOpacity="1"/></svg>;
}

const IconCozBan = React.forwardRef(IconCozBanComponent);
export default IconCozBan;
