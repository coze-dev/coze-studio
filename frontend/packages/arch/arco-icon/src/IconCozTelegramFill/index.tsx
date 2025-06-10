import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozTelegramFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_telegram_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12ZM16.4229 6.56443C16.9857 6.31736 17.5874 6.81689 17.4895 7.44977L16.04 16.8134C15.9519 17.3826 15.346 17.6793 14.8749 17.384L10.6753 14.7504C10.2375 14.4759 10.1653 13.8402 10.5292 13.465L14.2802 9.59776C14.4145 9.45939 14.2432 9.23594 14.0861 9.34452L8.87504 12.9447C8.48981 13.2108 8.01217 13.2835 7.57099 13.143L5.25971 12.4069C4.84118 12.2737 4.81167 11.6624 5.2152 11.4852L16.4229 6.56443Z"/></svg>;
}

const IconCozTelegramFill = React.forwardRef(IconCozTelegramFillComponent);
export default IconCozTelegramFill;
