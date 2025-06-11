import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozMatchComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_match${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M11 12C11 15.3137 13.6863 18 17 18C20.3137 18 23 15.3137 23 12V10C23 9.44772 22.5523 9 22 9C21.4477 9 21 9.44772 21 10V12C21 14.2091 19.2091 16 17 16C14.7909 16 13 14.2091 13 12C13 8.68629 10.3137 6 7 6C3.68629 6 1 8.68629 1 12V14C1 14.5523 1.44772 15 2 15C2.55228 15 3 14.5523 3 14V12C3 9.79086 4.79086 8 7 8C9.20914 8 11 9.79086 11 12Z"/></svg>;
}

const IconCozMatch = React.forwardRef(IconCozMatchComponent);
export default IconCozMatch;
