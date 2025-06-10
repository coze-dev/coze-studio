import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozPauseCircleComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_pause_circle${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M8.4 8.6C8.4 7.99249 8.89249 7.5 9.5 7.5 10.1075 7.5 10.6 7.99249 10.6 8.6V15.4C10.6 16.0075 10.1075 16.5 9.5 16.5 8.89249 16.5 8.4 16.0075 8.4 15.4V8.6zM13.4 8.6C13.4 7.99249 13.8925 7.5 14.5 7.5 15.1075 7.5 15.6 7.99249 15.6 8.6V15.4C15.6 16.0075 15.1075 16.5 14.5 16.5 13.8925 16.5 13.4 16.0075 13.4 15.4V8.6z"/><path d="M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23ZM12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3Z"/></svg>;
}

const IconCozPauseCircle = React.forwardRef(IconCozPauseCircleComponent);
export default IconCozPauseCircle;
