import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozSoundComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_sound${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M10 6.00006C10.5523 6.00006 11 6.44778 11 7.00006V17.0001C11 17.5523 10.5523 18.0001 10 18.0001 9.44772 18.0001 9 17.5523 9 17.0001V7.00006C9 6.44778 9.44772 6.00006 10 6.00006zM6.5 9.00006C7.05228 9.00006 7.5 9.44778 7.5 10.0001V14.0001C7.5 14.5523 7.05229 15.0001 6.5 15.0001 5.94772 15.0001 5.5 14.5523 5.5 14.0001V10.0001C5.5 9.44778 5.94772 9.00006 6.5 9.00006zM14.5 10.0001C14.5 9.44778 14.0523 9.00006 13.5 9.00006 12.9477 9.00006 12.5 9.44778 12.5 10.0001V14.0001C12.5 14.5523 12.9477 15.0001 13.5 15.0001 14.0523 15.0001 14.5 14.5523 14.5 14.0001V10.0001zM17 8.00006C17.5523 8.00006 18 8.44778 18 9.00006V15.0001C18 15.5523 17.5523 16.0001 17 16.0001 16.4477 16.0001 16 15.5523 16 15.0001V9.00006C16 8.44778 16.4477 8.00006 17 8.00006z"/><path fillRule="evenodd" clipRule="evenodd" d="M12 23.0001C18.0751 23.0001 23 18.0752 23 12.0001C23 5.92493 18.0751 1.00006 12 1.00006C5.92487 1.00006 1 5.92493 1 12.0001C1 15.1689 2.3399 18.0247 4.48405 20.032L3.72361 21.5528C3.39116 22.2177 3.87465 23.0001 4.61803 23.0001H12ZM6.94025 19.5917L5.85088 18.5719C4.09379 16.927 3 14.5928 3 12.0001C3 7.0295 7.02944 3.00006 12 3.00006C16.9706 3.00006 21 7.0295 21 12.0001C21 16.9706 16.9706 21.0001 12 21.0001H6.23607L6.94025 19.5917Z"/></svg>;
}

const IconCozSound = React.forwardRef(IconCozSoundComponent);
export default IconCozSound;
