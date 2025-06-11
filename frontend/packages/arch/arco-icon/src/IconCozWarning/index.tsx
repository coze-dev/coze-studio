import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozWarningComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_warning${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M12.0001 7C11.4478 7 11.0001 7.44772 11.0001 8V13C11.0001 13.5523 11.4478 14 12.0001 14 12.5524 14 13.0001 13.5523 13.0001 13V8C13.0001 7.44772 12.5524 7 12.0001 7zM12.0001 17C12.5524 17 13.0001 16.5523 13.0001 16 13.0001 15.4477 12.5524 15 12.0001 15 11.4478 15 11.0001 15.4477 11.0001 16 11.0001 16.5523 11.4478 17 12.0001 17z"/><path fillRule="evenodd" clipRule="evenodd" d="M20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33983 16C2.57003 17.3333 3.53228 19 5.07188 19H18.9283C20.4679 19 21.4301 17.3333 20.6603 16ZM15.4642 3C13.9246 0.333335 10.0756 0.333332 8.53599 3L1.60778 15C0.0681837 17.6667 1.99268 21 5.07188 21H18.9283C22.0075 21 23.932 17.6667 22.3924 15L15.4642 3Z"/></svg>;
}

const IconCozWarning = React.forwardRef(IconCozWarningComponent);
export default IconCozWarning;
