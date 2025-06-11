import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozAsynchronousTaskComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_asynchronous_task${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M19 3H5V21H11.1241C11.4455 21.7357 11.8816 22.4099 12.4097 23H5C3.89543 23 3 22.1046 3 21V3C3 1.89543 3.89543 1 5 1H19C20.1046 1 21 1.89543 21 3V11.1241C20.3733 10.8503 19.702 10.6596 19 10.5661V3Z"/><path d="M8 6.5C7.44772 6.5 7 6.94772 7 7.5 7 8.05228 7.44772 8.5 8 8.5H16C16.5523 8.5 17 8.05228 17 7.5 17 6.94772 16.5523 6.5 16 6.5H8zM8 11C7.44772 11 7 11.4477 7 12 7 12.5523 7.44772 13 8 13H10.5C11.0523 13 11.5 12.5523 11.5 12 11.5 11.4477 11.0523 11 10.5 11H8zM18 15C17.5858 15 17.25 15.3358 17.25 15.75V18.2407C17.2476 18.4358 17.3208 18.6316 17.4696 18.7804L18.8838 20.1946C19.1767 20.4875 19.6516 20.4875 19.9445 20.1946 20.2374 19.9017 20.2374 19.4268 19.9445 19.1339L18.75 17.9395V15.75C18.75 15.3358 18.4142 15 18 15z"/><path fillRule="evenodd" clipRule="evenodd" d="M24 18C24 21.3137 21.3137 24 18 24C14.6863 24 12 21.3137 12 18C12 14.6863 14.6863 12 18 12C21.3137 12 24 14.6863 24 18ZM22 18C22 20.2091 20.2091 22 18 22C15.7909 22 14 20.2091 14 18C14 15.7909 15.7909 14 18 14C20.2091 14 22 15.7909 22 18Z"/></svg>;
}

const IconCozAsynchronousTask = React.forwardRef(IconCozAsynchronousTaskComponent);
export default IconCozAsynchronousTask;
