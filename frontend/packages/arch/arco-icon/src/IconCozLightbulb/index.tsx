import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozLightbulbComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_lightbulb${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M8.10289 12.25C7.62459 12.5261 7.00322 12.3637 6.81812 11.8434C6.60841 11.2539 6.5 10.6306 6.5 10C6.5 9.03455 6.75413 8.08611 7.23686 7.25C7.71959 6.4139 8.41389 5.71959 9.25 5.23686C9.79609 4.92157 10.3901 4.7038 11.0055 4.59066C11.5487 4.49079 12 4.94772 12 5.5C12 6.05229 11.5432 6.4856 11.0132 6.64104C9.56068 7.06707 8.5 8.40967 8.5 10C8.5 10.2845 8.53393 10.561 8.59797 10.8258C8.7277 11.3621 8.58077 11.9741 8.10289 12.25Z"/><path fillRule="evenodd" clipRule="evenodd" d="M15.9732 17.5803L15.4189 19.2434C15.1687 19.9938 14.4665 20.5 13.6754 20.5H10.3246C9.53354 20.5 8.83128 19.9938 8.58114 19.2434L8.02676 17.5803C8.00991 17.5297 7.97026 17.4901 7.91973 17.4732C5.23846 16.5795 3.34782 14.1738 3.11311 11.3573L3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10L20.8869 11.3573C20.6522 14.1738 18.7615 16.5795 16.0803 17.4732C16.0297 17.4901 15.9901 17.5297 15.9732 17.5803ZM15.4478 15.5759C17.3701 14.9351 18.7255 13.2104 18.8938 11.1912L18.9996 9.92193C18.9577 6.0919 15.8399 3 12 3C8.16006 3 5.04228 6.0919 5.00043 9.92193L5.1062 11.1912C5.27447 13.2104 6.62992 14.9351 8.55218 15.5759C9.19988 15.7918 9.70821 16.3001 9.92412 16.9478L10.4415 18.5H13.5585L14.0759 16.9478C14.2918 16.3001 14.8001 15.7918 15.4478 15.5759Z"/><path d="M9 22.5C9 21.9477 9.44772 21.5 10 21.5H14C14.5523 21.5 15 21.9477 15 22.5C15 23.0523 14.5523 23.5 14 23.5H10C9.44772 23.5 9 23.0523 9 22.5Z"/></svg>;
}

const IconCozLightbulb = React.forwardRef(IconCozLightbulbComponent);
export default IconCozLightbulb;
