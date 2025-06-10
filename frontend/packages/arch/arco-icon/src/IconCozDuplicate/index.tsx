import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozDuplicateComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_duplicate${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M11 10.5C11 9.94771 10.5523 9.5 10 9.5C9.44771 9.5 9 9.94772 9 10.5V13H6.5C5.94771 13 5.5 13.4477 5.5 14C5.5 14.5523 5.94772 15 6.5 15H9V17.5C9 18.0523 9.44771 18.5 10 18.5C10.5523 18.5 11 18.0523 11 17.5V15H13.5C14.0523 15 14.5 14.5523 14.5 14C14.5 13.4477 14.0523 13 13.5 13H11V10.5Z"/><path d="M6 4C6 2.89543 6.89543 2 8 2H20C21.1046 2 22 2.89543 22 4V16C22 17.1046 21.1046 18 20 18H18V20C18 21.1046 17.1046 22 16 22H4C2.89543 22 2 21.1046 2 20V8C2 6.89543 2.89543 6 4 6H6V4ZM20 16V4H8V6H16C17.1046 6 18 6.89543 18 8V16H20ZM16 8H4V20H16V8Z"/></svg>;
}

const IconCozDuplicate = React.forwardRef(IconCozDuplicateComponent);
export default IconCozDuplicate;
