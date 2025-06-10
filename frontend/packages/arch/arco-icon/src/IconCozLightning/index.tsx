import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozLightningComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_lightning${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M9.00004 12.9999C10.1046 12.9999 11 13.8954 11 14.9999V19.677L18.5925 10.9999H15C13.8955 10.9999 13 10.1045 13 8.99995V4.32285L5.40758 12.9999H9.00004ZM13.1306 1.13642L2.54798 13.2309C1.9445 13.9206 2.43429 14.9999 3.35073 14.9999H7.00004H9.00004V16.9999V22.1611C9.00004 23.146 10.2209 23.6047 10.8695 22.8635L21.4521 10.769C22.0556 10.0793 21.5658 8.99995 20.6494 8.99995H17H15V6.99995V1.83883C15 0.853905 13.7792 0.395192 13.1306 1.13642Z"/></svg>;
}

const IconCozLightning = React.forwardRef(IconCozLightningComponent);
export default IconCozLightning;
