import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozCalendarClockComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_calendar_clock${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M8 3C8 2.44772 7.55228 2 7 2C6.44772 2 6 2.44772 6 3H3.99997C2.8954 3 2 3.89543 2 5V20C2 21.1046 2.89543 22 4 22H11.6546C11.2677 21.3875 10.967 20.7152 10.7696 20H4V5H6C6 5.55228 6.44772 6 7 6C7.55228 6 8 5.55228 8 5H16C16 5.55228 16.4477 6 17 6C17.5523 6 18 5.55228 18 5H20V10.7696C20.7152 10.967 21.3875 11.2677 22 11.6546V5C22 3.89543 21.1046 3 20 3H18C18 2.44772 17.5523 2 17 2C16.4477 2 16 2.44772 16 3H8Z"/><path d="M8 13C8.55228 13 9 13.4477 9 14V15C9 15.5523 8.55228 16 8 16H7C6.44772 16 6 15.5523 6 15V14C6 13.4477 6.44772 13 7 13H8zM6 9C6 8.44772 6.44772 8 7 8H8C8.55229 8 9 8.44772 9 9V10C9 10.5523 8.55228 11 8 11H7C6.44771 11 6 10.5523 6 10V9zM14 9C14 8.44772 13.5523 8 13 8H12C11.4477 8 11 8.44772 11 9V10C11 10.5523 11.4477 11 12 11H13C13.5523 11 14 10.5523 14 10V9zM18 15C17.5858 15 17.25 15.3358 17.25 15.75V18.2407C17.2476 18.4358 17.3208 18.6316 17.4696 18.7804L18.8838 20.1946C19.1767 20.4875 19.6516 20.4875 19.9445 20.1946 20.2374 19.9017 20.2374 19.4268 19.9445 19.1339L18.75 17.9395V15.75C18.75 15.3358 18.4142 15 18 15z"/><path fillRule="evenodd" clipRule="evenodd" d="M24 18C24 21.3137 21.3137 24 18 24C14.6863 24 12 21.3137 12 18C12 14.6863 14.6863 12 18 12C21.3137 12 24 14.6863 24 18ZM22 18C22 20.2091 20.2091 22 18 22C15.7909 22 14 20.2091 14 18C14 15.7909 15.7909 14 18 14C20.2091 14 22 15.7909 22 18Z"/></svg>;
}

const IconCozCalendarClock = React.forwardRef(IconCozCalendarClockComponent);
export default IconCozCalendarClock;
