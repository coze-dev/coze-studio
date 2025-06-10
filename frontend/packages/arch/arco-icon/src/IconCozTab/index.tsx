import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozTabComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_tab${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 25" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M18 3.5C17.4477 3.5 17 3.94772 17 4.5V5.5H23V4.5C23 3.94772 22.5523 3.5 22 3.5H18Z"/><path fillRule="evenodd" clipRule="evenodd" d="M1 20.5C1 21.0523 1.44772 21.5 2 21.5H22C22.5523 21.5 23 21.0523 23 20.5V7H8V4.5C8 3.94772 7.55228 3.5 7 3.5H2C1.44772 3.5 1 3.94772 1 4.5V20.5ZM3 19.5H21V9H3V19.5Z"/><path d="M9.5 4.5C9.5 3.94772 9.94772 3.5 10.5 3.5H14.5C15.0523 3.5 15.5 3.94772 15.5 4.5V5.5H9.5V4.5Z"/></svg>;
}

const IconCozTab = React.forwardRef(IconCozTabComponent);
export default IconCozTab;
