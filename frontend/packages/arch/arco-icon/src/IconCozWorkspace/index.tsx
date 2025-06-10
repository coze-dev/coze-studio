import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozWorkspaceComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_workspace${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M12 14.5C12 13.9477 12.4477 13.5 13 13.5H17C17.5523 13.5 18 13.9477 18 14.5 18 15.0523 17.5523 15.5 17 15.5H13C12.4477 15.5 12 15.0523 12 14.5zM6.03508 9.87868C5.64456 9.48815 5.64456 8.85499 6.03508 8.46446 6.4256 8.07394 7.05877 8.07394 7.44929 8.46446L10.2777 11.2929C10.2954 11.3106 10.3123 11.3288 10.3285 11.3475 10.6231 11.6889 10.6489 12.1822 10.4059 12.5502 10.3693 12.6057 10.3265 12.6583 10.2777 12.7071L7.44929 15.5355C7.05877 15.9261 6.4256 15.9261 6.03508 15.5355 5.64456 15.145 5.64456 14.5118 6.03508 14.1213L8.1564 12 6.03508 9.87868z"/><path fillRule="evenodd" clipRule="evenodd" d="M3 2C1.89543 2 1 2.89543 1 4V19C1 20.1046 1.89543 21 3 21H21C22.1046 21 23 20.1046 23 19V6C23 4.89543 22.1046 4 21 4H12L10.5858 2.58579C10.2107 2.21071 9.70201 2 9.17157 2H3ZM12 6C11.4696 6 10.9609 5.78929 10.5858 5.41421L9.17157 4L3 4L3 19H21V6H12Z"/></svg>;
}

const IconCozWorkspace = React.forwardRef(IconCozWorkspaceComponent);
export default IconCozWorkspace;
