import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozAsynchronousTaskFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_asynchronous_task_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M18 12C21.3137 12 24 14.6863 24 18C24 21.3137 21.3137 24 18 24C14.6863 24 12 21.3137 12 18C12 14.6863 14.6863 12 18 12ZM19 1C20.1046 1 21 1.89543 21 3V11.126C20.0811 10.7244 19.0669 10.5 18 10.5C13.8579 10.5 10.5 13.8579 10.5 18C10.5 19.9212 11.2232 21.673 12.4111 23H5C3.89543 23 3 22.1046 3 21V3C3 1.89543 3.89543 1 5 1H19ZM18 15C17.5858 15 17.25 15.3358 17.25 15.75V18.25C17.25 18.295 17.2541 18.339 17.2617 18.3818C17.2711 18.4344 17.286 18.4861 17.3066 18.5361C17.3147 18.5556 17.3263 18.5732 17.3359 18.5918C17.3706 18.6591 17.4133 18.7238 17.4697 18.7803L18.8838 20.1943C19.1767 20.4872 19.6514 20.4872 19.9443 20.1943C20.2372 19.9014 20.2372 19.4267 19.9443 19.1338L18.75 17.9395V15.75C18.75 15.3358 18.4142 15 18 15ZM8 11C7.44772 11 7 11.4477 7 12C7 12.5523 7.44772 13 8 13H10C10.5523 13 11 12.5523 11 12C11 11.4477 10.5523 11 10 11H8ZM8 6.5C7.44772 6.5 7 6.94772 7 7.5C7 8.05228 7.44772 8.5 8 8.5H16C16.5523 8.5 17 8.05228 17 7.5C17 6.94772 16.5523 6.5 16 6.5H8Z"/></svg>;
}

const IconCozAsynchronousTaskFill = React.forwardRef(IconCozAsynchronousTaskFillComponent);
export default IconCozAsynchronousTaskFill;
