import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozMicrophoneComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_microphone${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M12 1C9.23858 1 7 3.23858 7 6V11C7 13.7614 9.23858 16 12 16C14.7614 16 17 13.7614 17 11V6C17 3.23858 14.7614 1 12 1ZM15 11C15 12.6569 13.6569 14 12 14C10.3431 14 9 12.6569 9 11V6C9 4.34315 10.3431 3 12 3C13.6569 3 15 4.34315 15 6V11Z"/><path d="M20 9C19.4477 9 19 9.44771 19 10V11C19 14.866 15.866 18 12 18C8.13401 18 5 14.866 5 11V10C5 9.44772 4.55228 9 4 9C3.44772 9 3 9.44771 3 10V11C3 15.6326 6.50005 19.4476 11 19.9451V22.5C11 23.0523 11.4477 23.5 12 23.5C12.5523 23.5 13 23.0523 13 22.5V19.9451C17.5 19.4476 21 15.6326 21 11V10C21 9.44772 20.5523 9 20 9Z"/></svg>;
}

const IconCozMicrophone = React.forwardRef(IconCozMicrophoneComponent);
export default IconCozMicrophone;
