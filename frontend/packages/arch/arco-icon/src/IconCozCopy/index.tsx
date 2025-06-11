import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozCopyComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_copy${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M9 3C9 2.44772 9.44772 2 10 2H20C20.5523 2 21 2.44772 21 3V15C21 15.5523 20.5523 16 20 16C19.4477 16 19 15.5523 19 15V4H10C9.44771 4 9 3.55228 9 3Z"/><path d="M5 6C3.89543 6 3 6.89543 3 8V20C3 21.1046 3.89543 22 5 22H15C16.1046 22 17 21.1046 17 20V8C17 6.89543 16.1046 6 15 6H5ZM5 8H15V20H5L5 8Z"/></svg>;
}

const IconCozCopy = React.forwardRef(IconCozCopyComponent);
export default IconCozCopy;
