import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozExitComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_exit${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M4 2C2.89543 2 2 2.89543 2 4V20C2 21.1046 2.89543 22 4 22H20C21.1046 22 22 21.1046 22 20V15.1168L20.3515 16.2045C20.2371 16.28 20.1195 16.3419 20 16.391V20H4V4H20V7.60899C20.1195 7.65812 20.2371 7.72004 20.3515 7.7955L22 8.88324V4C22 2.89543 21.1046 2 20 2H4Z"/><path d="M10 12C10 11.4477 10.4477 11 11 11H18.75V9.46485C18.75 9.06657 19.1929 8.82816 19.5254 9.04751L23.3675 11.5827C23.667 11.7803 23.667 12.2197 23.3675 12.4173L19.5254 14.9525C19.1929 15.1718 18.75 14.9334 18.75 14.5352V13H11C10.4477 13 10 12.5523 10 12Z"/></svg>;
}

const IconCozExit = React.forwardRef(IconCozExitComponent);
export default IconCozExit;
