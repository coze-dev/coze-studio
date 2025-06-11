import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozSoundFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_sound_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M23 12C23 18.0751 18.0751 23 12 23H4.61803C3.87465 23 3.39116 22.2177 3.72361 21.5528L4.48405 20.0319C2.3399 18.0247 1 15.1688 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12ZM9.8 5.79995C10.4627 5.79995 11 6.33721 11 6.99995V17C11 17.6627 10.4627 18.2 9.8 18.2C9.13726 18.2 8.6 17.6627 8.6 17V6.99995C8.6 6.33721 9.13726 5.79995 9.8 5.79995ZM5.8 8.79995C6.46274 8.79995 7 9.33721 7 9.99995V14C7 14.6627 6.46274 15.2 5.8 15.2C5.13726 15.2 4.6 14.6627 4.6 14V9.99995C4.6 9.33721 5.13726 8.79995 5.8 8.79995ZM15 9.99995C15 9.33721 14.4627 8.79995 13.8 8.79995C13.1373 8.79995 12.6 9.33721 12.6 9.99995V14C12.6 14.6627 13.1373 15.2 13.8 15.2C14.4627 15.2 15 14.6627 15 14V9.99995ZM17.8 7.79995C18.4627 7.79995 19 8.33721 19 8.99995V15C19 15.6627 18.4627 16.2 17.8 16.2C17.1373 16.2 16.6 15.6627 16.6 15V8.99995C16.6 8.33721 17.1373 7.79995 17.8 7.79995Z"/></svg>;
}

const IconCozSoundFill = React.forwardRef(IconCozSoundFillComponent);
export default IconCozSoundFill;
