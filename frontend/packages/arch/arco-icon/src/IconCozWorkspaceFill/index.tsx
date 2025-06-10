import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozWorkspaceFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_workspace_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M1 4C1 2.89543 1.89543 2 3 2H9.17157C9.70201 2 10.2107 2.21071 10.5858 2.58579L12 4H21C22.1046 4 23 4.89543 23 6V19C23 20.1046 22.1046 21 21 21H3C1.89543 21 1 20.1046 1 19V4ZM12 14.5C12 13.8925 12.4925 13.4 13.1 13.4H17.4C18.0075 13.4 18.5 13.8925 18.5 14.5C18.5 15.1075 18.0075 15.6 17.4 15.6H13.1C12.4925 15.6 12 15.1075 12 14.5ZM10.3483 11.2224C10.3866 11.2606 10.4214 11.301 10.4528 11.3431C10.7303 11.7148 10.7425 12.2219 10.4893 12.6054C10.449 12.6664 10.402 12.7243 10.3483 12.778L7.30775 15.8186C6.87817 16.2481 6.18169 16.2481 5.75211 15.8186C5.32254 15.389 5.32254 14.6925 5.75211 14.2629L8.01486 12.0002L5.75211 9.73744C5.32254 9.30786 5.32254 8.61138 5.75211 8.1818C6.18169 7.75222 6.87817 7.75222 7.30775 8.1818L10.3483 11.2224Z"/></svg>;
}

const IconCozWorkspaceFill = React.forwardRef(IconCozWorkspaceFillComponent);
export default IconCozWorkspaceFill;
