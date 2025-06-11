import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozCompassComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_compass${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21ZM12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23ZM14.3249 13.2745C14.1224 13.7495 13.7439 14.1278 13.2688 14.3302L8.15609 16.5076C7.74506 16.6827 7.32753 16.248 7.50176 15.848L9.71502 10.7663C9.91651 10.3037 10.2854 9.93439 10.7478 9.73233L15.8459 7.50439C16.2556 7.32533 16.6773 7.75692 16.506 8.15864L14.3249 13.2745Z"/></svg>;
}

const IconCozCompass = React.forwardRef(IconCozCompassComponent);
export default IconCozCompass;
