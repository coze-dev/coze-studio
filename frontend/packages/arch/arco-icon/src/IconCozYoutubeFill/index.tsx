import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozYoutubeFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_youtube_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M20.5974 4.7128C21.5442 4.96746 22.2897 5.71782 22.5427 6.67062C23.0025 8.3976 23.0024 12.001 23.0024 12.001C23.0024 12.001 23.0024 15.6041 22.5426 17.3313C22.2896 18.2841 21.5441 19.0344 20.5973 19.2892C18.8816 19.7518 12.0011 19.7518 12.0011 19.7518C12.0011 19.7518 5.12078 19.7518 3.40496 19.2892C2.45826 19.0343 1.71258 18.2841 1.45971 17.3312C1 15.604 1 12.0009 1 12.0009C1 12.0009 1 8.3976 1.45971 6.67062C1.71258 5.71782 2.45826 4.96746 3.40505 4.7128C5.12088 4.25 12.0012 4.25 12.0012 4.25C12.0012 4.25 18.8817 4.25 20.5974 4.7128ZM15.5013 12.0011L9.75067 15.2724V8.72941L15.5013 12.0011Z"/></svg>;
}

const IconCozYoutubeFill = React.forwardRef(IconCozYoutubeFillComponent);
export default IconCozYoutubeFill;
