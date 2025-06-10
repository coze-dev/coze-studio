import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozShadowComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_shadow${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M2 4C2 2.89543 2.89543 2 4 2H16.5C17.6046 2 18.5 2.89543 18.5 4V18.5H4C2.89543 18.5 2 17.6046 2 16.5V4ZM4 4H16.5V16.5H4V4Z"/><path d="M7 22C5.89543 22 5 21.1046 5 20H9.97L7.97 22H7zM10.0913 22H14.9706L16.9706 20H12.0913L10.0913 22zM18.5 22H17.0919L19.3694 19.7225C19.5058 19.6253 19.6253 19.5058 19.7225 19.3694L22 17.0919V18.5C22 20.433 20.433 22 18.5 22zM22 14.9706L20 16.9706V12.0913L22 10.0913V14.9706zM20 9.97L22 7.97V7C22 5.89543 21.1046 5 20 5V9.97z"/></svg>;
}

const IconCozShadow = React.forwardRef(IconCozShadowComponent);
export default IconCozShadow;
