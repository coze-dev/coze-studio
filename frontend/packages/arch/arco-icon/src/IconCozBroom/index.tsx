import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozBroomComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_broom${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M9 2V6L4 6C2.89543 6 2 6.89543 2 8V21C2 22.1046 2.89543 23 4 23H20C21.1046 23 22 22.1046 22 21V8C22 6.89543 21.1046 6 20 6L15 6V2C15 0.895431 14.1046 0 13 0H11C9.89543 0 9 0.895431 9 2ZM13 2V8H20V12H4V8H11V2H13ZM4 14H20V21H9V18C9 17.4477 8.55228 17 8 17C7.44772 17 7 17.4477 7 18V21H4L4 14Z"/></svg>;
}

const IconCozBroom = React.forwardRef(IconCozBroomComponent);
export default IconCozBroom;
