import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozPlaygroundComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_playground${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M3 5H21V10.693L23 11.8477V5C23 3.89543 22.1046 3 21 3H3C1.89543 3 1 3.89543 1 5V19C1 20.1046 1.89543 21 3 21H11.6665C11.2642 20.4227 11.0382 19.7274 11.038 19H3L3 5Z"/><path d="M18 18.4999C18.8284 18.4999 19.5 17.8284 19.5 16.9999C19.5 16.1715 18.8284 15.4999 18 15.4999C17.1716 15.4999 16.5 16.1715 16.5 16.9999C16.5 17.8284 17.1716 18.4999 18 18.4999Z"/><path fillRule="evenodd" clipRule="evenodd" d="M17.0001 11.2726C17.6189 10.9153 18.3813 10.9153 19.0001 11.2726L22.4601 13.2702C23.0789 13.6275 23.4601 14.2878 23.4601 15.0023V18.9976C23.4601 19.7121 23.0789 20.3724 22.4601 20.7296L19.0001 22.7273C18.3813 23.0845 17.6189 23.0845 17.0001 22.7273L13.54 20.7296C12.9212 20.3724 12.54 19.7121 12.54 18.9976V15.0023C12.54 14.2878 12.9212 13.6275 13.54 13.2702L17.0001 11.2726ZM18.0001 13.0046L21.4601 15.0023V18.9976L18.0001 20.9952L14.54 18.9976V15.0023L18.0001 13.0046Z"/><path d="M5.79289 9.87874C5.40237 9.48821 5.40237 8.85505 5.79289 8.46452C6.18342 8.074 6.81658 8.074 7.20711 8.46452L10.0355 11.293C10.0532 11.3107 10.0702 11.3289 10.0863 11.3476C10.3809 11.689 10.4067 12.1823 10.1637 12.5503C10.1271 12.6057 10.0844 12.6584 10.0355 12.7072L7.20711 15.5356C6.81658 15.9261 6.18342 15.9261 5.79289 15.5356C5.40237 15.1451 5.40237 14.5119 5.79289 14.1214L7.91422 12.0001L5.79289 9.87874Z"/></svg>;
}

const IconCozPlayground = React.forwardRef(IconCozPlaygroundComponent);
export default IconCozPlayground;
