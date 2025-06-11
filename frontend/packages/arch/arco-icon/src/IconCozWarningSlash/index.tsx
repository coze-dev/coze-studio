import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozWarningSlashComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_warning_slash${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M4.99337 9.136L1.60778 15C.0681837 17.6667 1.99268 21 5.07188 21H16.8574L14.8574 19H5.07188C3.53228 19 2.57003 17.3333 3.33983 16L6.45747 10.6001 4.99337 9.136zM20.8753 16.5326C20.8312 16.3524 20.7604 16.1734 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L9.5633 5.22065 8.09919 3.75655 8.53599 3C10.0756.333332 13.9246.333335 15.4642 3L22.3924 15C23.0259 16.0972 23.0729 17.3073 22.6943 18.3516L20.8753 16.5326zM1.80327 1.7033C2.19379 1.31277 2.82695 1.31277 3.21748 1.70329L9.00012 7.4859V10.3143L1.80327 3.11751C1.41275 2.72699 1.41274 2.09382 1.80327 1.7033zM15.0001 16.3143L20.8944 22.2085C21.285 22.5991 21.9181 22.5991 22.3086 22.2085 22.6992 21.818 22.6992 21.1848 22.3086 20.7943L15.0001 13.4859V16.3143z"/><path d="M11.0001 8C11.0001 7.44772 11.4478 7 12.0001 7 12.5524 7 13.0001 7.44772 13.0001 8V13C13.0001 13.5523 12.5524 14 12.0001 14 11.4478 14 11.0001 13.5523 11.0001 13V8zM13.0001 16C13.0001 16.5523 12.5524 17 12.0001 17 11.4478 17 11.0001 16.5523 11.0001 16 11.0001 15.4477 11.4478 15 12.0001 15 12.5524 15 13.0001 15.4477 13.0001 16z"/></svg>;
}

const IconCozWarningSlash = React.forwardRef(IconCozWarningSlashComponent);
export default IconCozWarningSlash;
