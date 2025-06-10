import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozRectangleSettingComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_rectangle_setting${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M3.00006 3C1.89549 3 1.00006 3.89543 1.00006 5V19C1.00006 20.1046 1.89549 21 3.00006 21H11.6666C11.2643 20.4227 11.0383 19.7274 11.038 19H3.00006V5H21.0001V10.693L23.0001 11.8477V5C23.0001 3.89543 22.1046 3 21.0001 3H3.00006Z"/><path d="M19.5001 16.9999C19.5001 17.8284 18.8285 18.4999 18.0001 18.4999C17.1716 18.4999 16.5001 17.8284 16.5001 16.9999C16.5001 16.1715 17.1716 15.4999 18.0001 15.4999C18.8285 15.4999 19.5001 16.1715 19.5001 16.9999Z"/><path fillRule="evenodd" clipRule="evenodd" d="M19.0001 11.2726C18.3813 10.9153 17.6189 10.9153 17.0001 11.2726L13.5401 13.2702C12.9213 13.6275 12.5401 14.2878 12.5401 15.0023V18.9976C12.5401 19.7121 12.9213 20.3724 13.5401 20.7296L17.0001 22.7273C17.6189 23.0845 18.3813 23.0845 19.0001 22.7273L22.4601 20.7296C23.0789 20.3724 23.4601 19.7121 23.4601 18.9976V15.0023C23.4601 14.2878 23.0789 13.6275 22.4601 13.2702L19.0001 11.2726ZM21.4601 15.0023L18.0001 13.0046L14.5401 15.0023V18.9976L18.0001 20.9952L21.4601 18.9976V15.0023Z"/></svg>;
}

const IconCozRectangleSetting = React.forwardRef(IconCozRectangleSettingComponent);
export default IconCozRectangleSetting;
