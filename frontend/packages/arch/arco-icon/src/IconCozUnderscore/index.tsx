import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozUnderscoreComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_underscore${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M7.36125 3.05201C7.36125 2.50303 6.921 2.05798 6.37201 2.05798C5.82303 2.05798 5.37319 2.50303 5.37319 3.05201V8.81737C5.37319 13.0216 7.97414 16.1069 12 16.1069C16.0259 16.1069 18.6269 13.0216 18.6269 8.81737V3.05212C18.6269 2.5031 18.1798 2.05812 17.6308 2.05803C17.0819 2.05795 16.6388 2.50297 16.6388 3.0519V8.81737C16.6388 11.8204 14.8757 14.1189 12 14.1189C9.1244 14.1189 7.36125 11.8204 7.36125 8.81737V3.05201ZM3.0536 19.4203C2.50461 19.4203 2.05957 19.8588 2.05957 20.4077C2.05957 20.9567 2.50461 21.4084 3.0536 21.4084H20.9461C21.4951 21.4084 21.9401 20.955 21.9401 20.406C21.9401 19.857 21.4951 19.4203 20.9461 19.4203H3.0536Z"/></svg>;
}

const IconCozUnderscore = React.forwardRef(IconCozUnderscoreComponent);
export default IconCozUnderscore;
