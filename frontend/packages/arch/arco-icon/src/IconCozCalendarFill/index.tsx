import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozCalendarFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_calendar_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M7 2C7.55228 2 8 2.44772 8 3H16C16 2.44772 16.4477 2 17 2C17.5523 2 18 2.44772 18 3H20C21.1046 3 22 3.89543 22 5V20C22 21.1046 21.1046 22 20 22H4C2.89543 22 2 21.1046 2 20V5C2 3.89543 2.8954 3 3.99997 3H6C6 2.44772 6.44772 2 7 2ZM9 15C9 14.4477 8.55228 14 8 14H7C6.44772 14 6 14.4477 6 15V16C6 16.5523 6.44772 17 7 17H8C8.55228 17 9 16.5523 9 16V15ZM13.5 15C13.5 14.4477 13.0523 14 12.5 14H11.5C10.9477 14 10.5 14.4477 10.5 15V16C10.5 16.5523 10.9477 17 11.5 17H12.5C13.0523 17 13.5 16.5523 13.5 16V15ZM18 10C18 9.44772 17.5523 9 17 9H16C15.4477 9 15 9.44772 15 10V11C15 11.5523 15.4477 12 16 12H17C17.5523 12 18 11.5523 18 11V10ZM12.5 9H11.5C10.9477 9 10.5 9.44772 10.5 10V11C10.5 11.5523 10.9477 12 11.5 12H12.5C13.0523 12 13.5 11.5523 13.5 11V10C13.5 9.44772 13.0523 9 12.5 9ZM16 14C15.4477 14 15 14.4477 15 15V16C15 16.5523 15.4477 17 16 17H17C17.5523 17 18 16.5523 18 16V15C18 14.4477 17.5523 14 17 14H16Z"/></svg>;
}

const IconCozCalendarFill = React.forwardRef(IconCozCalendarFillComponent);
export default IconCozCalendarFill;
