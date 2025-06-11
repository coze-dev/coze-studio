import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozWarningCircleComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_warning_circle${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21ZM12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23Z"/><path d="M12 7C11.4477 7 11 7.44772 11 8V13C11 13.5523 11.4477 14 12 14 12.5523 14 13 13.5523 13 13V8C13 7.44772 12.5523 7 12 7zM12 15C11.4477 15 11 15.4477 11 16 11 16.5523 11.4477 17 12 17 12.5523 17 13 16.5523 13 16 13 15.4477 12.5523 15 12 15z"/></svg>;
}

const IconCozWarningCircle = React.forwardRef(IconCozWarningCircleComponent);
export default IconCozWarningCircle;
