import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozPauseFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_pause_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 25 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M5.786 5.04601C5.677 5.25992 5.677 5.53995 5.677 6.1V17.9C5.677 18.4601 5.677 18.7401 5.786 18.954 5.88187 19.1422 6.03485 19.2951 6.22301 19.391 6.43692 19.5 6.71695 19.5 7.277 19.5H8.077C8.63705 19.5 8.91708 19.5 9.13099 19.391 9.31915 19.2951 9.47214 19.1422 9.56801 18.954 9.677 18.7401 9.677 18.4601 9.677 17.9V6.1C9.677 5.53995 9.677 5.25992 9.56801 5.04601 9.47214 4.85785 9.31915 4.70487 9.13099 4.60899 8.91708 4.5 8.63705 4.5 8.077 4.5H7.277C6.71695 4.5 6.43692 4.5 6.22301 4.60899 6.03485 4.70487 5.88187 4.85785 5.786 5.04601zM14.786 5.04601C14.677 5.25992 14.677 5.53995 14.677 6.1V17.9C14.677 18.4601 14.677 18.7401 14.786 18.954 14.8819 19.1422 15.0348 19.2951 15.223 19.391 15.4369 19.5 15.7169 19.5 16.277 19.5H17.077C17.6371 19.5 17.9171 19.5 18.131 19.391 18.3192 19.2951 18.4721 19.1422 18.568 18.954 18.677 18.7401 18.677 18.4601 18.677 17.9V6.1C18.677 5.53995 18.677 5.25992 18.568 5.04601 18.4721 4.85785 18.3192 4.70487 18.131 4.60899 17.9171 4.5 17.6371 4.5 17.077 4.5H16.277C15.7169 4.5 15.4369 4.5 15.223 4.60899 15.0348 4.70487 14.8819 4.85785 14.786 5.04601z"/></svg>;
}

const IconCozPauseFill = React.forwardRef(IconCozPauseFillComponent);
export default IconCozPauseFill;
