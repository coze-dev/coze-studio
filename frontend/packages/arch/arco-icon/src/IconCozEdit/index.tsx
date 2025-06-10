import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozEditComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_edit${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M19.2531 2.64649C19.8389 2.06071 20.7886 2.06071 21.3744 2.64649 21.9602 3.23228 21.9602 4.18203 21.3744 4.76781L20.3138 5.82847 18.1925 3.70715 19.2531 2.64649zM17.1392 4.76043L19.2605 6.88175 11.4426 14.6996C11.2337 14.9085 10.9647 15.0469 10.6732 15.0954L8.78231 15.4098C8.72828 15.4188 8.67325 15.4012 8.63453 15.3624 8.59531 15.3232 8.57774 15.2673 8.58748 15.2127L8.92316 13.3307C8.97322 13.05 9.10815 12.7915 9.30975 12.5899L17.1392 4.76043z"/><path d="M13.5 3H4C2.89543 3 2 3.89543 2 5V20C2 21.1046 2.89543 22 4 22H19C20.1046 22 21 21.1046 21 20V10L19 12V20H4V5H11.5L13.5 3Z"/></svg>;
}

const IconCozEdit = React.forwardRef(IconCozEditComponent);
export default IconCozEdit;
