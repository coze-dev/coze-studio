import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozMicrophoneFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_microphone_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M7 6C7 3.23858 9.23858 1 12 1C14.7614 1 17 3.23858 17 6V11C17 13.7614 14.7614 16 12 16C9.23858 16 7 13.7614 7 11V6Z"/><path d="M20 9C19.4477 9 19 9.44771 19 10V11C19 14.866 15.866 18 12 18C8.13401 18 5 14.866 5 11V10C5 9.44772 4.55228 9 4 9C3.44772 9 3 9.44771 3 10V11C3 15.6326 6.50005 19.4476 11 19.9451V22.5C11 23.0523 11.4477 23.5 12 23.5C12.5523 23.5 13 23.0523 13 22.5V19.9451C17.5 19.4476 21 15.6326 21 11V10C21 9.44772 20.5523 9 20 9Z"/></svg>;
}

const IconCozMicrophoneFill = React.forwardRef(IconCozMicrophoneFillComponent);
export default IconCozMicrophoneFill;
