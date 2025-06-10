import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozShareComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_share${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M17.8284 8.0001C14.844 8.00732 12.4805 8.55308 10.4963 9.63358C8.59783 10.6673 7.11968 12.1724 6.10439 14.1053C5.94116 14.4161 5.79036 14.736 5.65199 15.0659C5.59118 15.2109 5.51393 15.4125 5.42024 15.6706C5.34848 15.8684 5.16061 16 4.95024 16H3.88901C3.61286 16 3.389 15.7762 3.389 15.5C3.389 15.4474 3.3973 15.3952 3.41359 15.3452C3.43303 15.2855 3.4508 15.2323 3.46689 15.1857C3.71316 14.4722 4.00501 13.7998 4.34071 13.1621C5.5418 10.8806 7.30434 9.09011 9.55017 7.86996C11.783 6.65688 14.4484 6.00758 17.8285 6.00009L15.2912 3.46284C14.9019 3.07352 14.9056 2.44166 15.2949 2.05233C15.6843 1.66301 16.3161 1.65931 16.7055 2.04863L21.3033 6.64647C21.4986 6.84174 21.4986 7.15832 21.3033 7.35358L16.7017 11.9552C16.3152 12.3417 15.6862 12.3295 15.2997 11.943C14.9132 11.5564 14.901 10.9275 15.2875 10.541L17.8284 8.0001ZM20 18C20.5523 18 21 18.4478 21 19V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V19C3 18.4478 3.44772 18 4 18C4.55228 18 5 18.4478 5 19V20H19V19C19 18.4478 19.4477 18 20 18Z"/></svg>;
}

const IconCozShare = React.forwardRef(IconCozShareComponent);
export default IconCozShare;
