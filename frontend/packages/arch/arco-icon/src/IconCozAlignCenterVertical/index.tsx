import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozAlignCenterVerticalComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_align_center_vertical${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M12.8 1.33331C13.0945 1.33331 13.3333 1.57209 13.3333 1.86665V6.89998H17.632C17.9266 6.89998 18.1654 7.29673 18.1654 7.78615V9.61381C18.1654 10.1032 17.9266 10.5 17.632 10.5H13.3333V13.4998H19.6277C19.9223 13.4998 20.1611 13.8966 20.1611 14.386V16.2137C20.1611 16.7031 19.9223 17.0998 19.6277 17.0998H13.3333V22.1333C13.3333 22.4279 13.0945 22.6666 12.8 22.6666H11.8666C11.5721 22.6666 11.3333 22.4279 11.3333 22.1333V17.0998H4.3722C4.07765 17.0998 3.83887 16.7031 3.83887 16.2137V14.386C3.83887 13.8966 4.07765 13.4998 4.3722 13.4998H11.3333V10.5H6.36799C6.07344 10.5 5.83466 10.1032 5.83466 9.61381V7.78615C5.83466 7.29673 6.07344 6.89998 6.36799 6.89998H11.3333V1.86665C11.3333 1.57209 11.5721 1.33331 11.8666 1.33331H12.8Z"/></svg>;
}

const IconCozAlignCenterVertical = React.forwardRef(IconCozAlignCenterVerticalComponent);
export default IconCozAlignCenterVertical;
