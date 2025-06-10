import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozCalendarClockFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_calendar_clock_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M7 2C7.55228 2 8 2.44772 8 3H16C16 2.44772 16.4477 2 17 2C17.5523 2 18 2.44772 18 3H20C21.1046 3 22 3.89543 22 5V11.6546C20.8423 10.9232 19.4706 10.5 18 10.5C13.8579 10.5 10.5 13.8579 10.5 18C10.5 19.4706 10.9232 20.8423 11.6546 22H4C2.89543 22 2 21.1046 2 20V5C2 3.89543 2.8954 3 3.99997 3H6C6 2.44772 6.44772 2 7 2ZM7 8C6.44772 8 6 8.44772 6 9V10C6 10.5523 6.44771 11 7 11H8C8.55228 11 9 10.5523 9 10V9C9 8.44772 8.55229 8 8 8H7ZM8 13C8.55228 13 9 13.4477 9 14V15C9 15.5523 8.55228 16 8 16H7C6.44772 16 6 15.5523 6 15V14C6 13.4477 6.44772 13 7 13H8ZM13 8C13.5523 8 14 8.44772 14 9V10C14 10.5523 13.5523 11 13 11H12C11.4477 11 11 10.5523 11 10V9C11 8.44772 11.4477 8 12 8H13Z"/><path fillRule="evenodd" clipRule="evenodd" d="M18 24C21.3137 24 24 21.3137 24 18C24 14.6863 21.3137 12 18 12C14.6863 12 12 14.6863 12 18C12 21.3137 14.6863 24 18 24ZM18 15C17.5858 15 17.25 15.3358 17.25 15.75V18.2359C17.2463 18.4325 17.3195 18.6303 17.4695 18.7803L18.8838 20.1945C19.1766 20.4874 19.6515 20.4874 19.9444 20.1945C20.2373 19.9016 20.2373 19.4268 19.9444 19.1339L18.75 17.9395V15.75C18.75 15.3358 18.4142 15 18 15Z"/></svg>;
}

const IconCozCalendarClockFill = React.forwardRef(IconCozCalendarClockFillComponent);
export default IconCozCalendarClockFill;
