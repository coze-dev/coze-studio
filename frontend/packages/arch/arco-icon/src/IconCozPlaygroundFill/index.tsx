import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozPlaygroundFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_playground_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M3 3C1.89543 3 1 3.89543 1 5V19C1 20.1046 1.89543 21 3 21H11.6665C11.264 20.4223 11.038 19.7267 11.038 18.9988V15.0012C11.038 13.7508 11.7051 12.5953 12.788 11.9701L16.25 9.9713C17.3329 9.34609 18.6671 9.34609 19.75 9.9713L23 11.8477V5C23 3.89543 22.1046 3 21 3H3ZM9.52291 11.3431C9.49148 11.301 9.45663 11.2606 9.41838 11.2224L6.37782 8.1818C5.94824 7.75222 5.25176 7.75222 4.82218 8.1818C4.39261 8.61138 4.39261 9.30786 4.82218 9.73744L7.08493 12.0002L4.82218 14.2629C4.39261 14.6925 4.39261 15.389 4.82218 15.8186C5.25176 16.2481 5.94824 16.2481 6.37782 15.8186L9.41838 12.778C9.47207 12.7243 9.51906 12.6664 9.55933 12.6054C9.81255 12.2219 9.80041 11.7148 9.52291 11.3431Z"/><path fillRule="evenodd" clipRule="evenodd" d="M17.0001 11.2726C17.6189 10.9153 18.3813 10.9153 19.0001 11.2726L22.4601 13.2702C23.0789 13.6275 23.4601 14.2878 23.4601 15.0023V18.9976C23.4601 19.7121 23.0789 20.3724 22.4601 20.7296L19.0001 22.7273C18.3813 23.0845 17.6189 23.0845 17.0001 22.7273L13.54 20.7296C12.9212 20.3724 12.54 19.7121 12.54 18.9976V15.0023C12.54 14.2878 12.9212 13.6275 13.54 13.2702L17.0001 11.2726ZM19.75 16.9999C19.75 17.9664 18.9665 18.7499 18 18.7499C17.0335 18.7499 16.25 17.9664 16.25 16.9999C16.25 16.0334 17.0335 15.2499 18 15.2499C18.9665 15.2499 19.75 16.0334 19.75 16.9999Z"/></svg>;
}

const IconCozPlaygroundFill = React.forwardRef(IconCozPlaygroundFillComponent);
export default IconCozPlaygroundFill;
