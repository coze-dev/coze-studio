import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozAutoLayoutComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_auto_layout${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M3 2C2.44772 2 2 2.44771 2 3V12C2 12.5523 2.44772 13 3 13H10C10.5523 13 11 12.5523 11 12V3C11 2.44772 10.5523 2 10 2H3zM4 11V4H9V11H4zM21 22C21.5523 22 22 21.5523 22 21V12C22 11.4477 21.5523 11 21 11H14C13.4477 11 13 11.4477 13 12V21C13 21.5523 13.4477 22 14 22H21zM20 13V20H15V13H20zM2 16C2 15.4477 2.44772 15 3 15H10C10.5523 15 11 15.4477 11 16V21C11 21.5523 10.5523 22 10 22H3C2.44772 22 2 21.5523 2 21V16zM4 20V17H9V20H4zM21 9C21.5523 9 22 8.55228 22 8V3C22 2.44772 21.5523 2 21 2H14C13.4477 2 13 2.44772 13 3V8C13 8.55228 13.4477 9 14 9H21zM20 4V7H15V4H20z"/></svg>;
}

const IconCozAutoLayout = React.forwardRef(IconCozAutoLayoutComponent);
export default IconCozAutoLayout;
