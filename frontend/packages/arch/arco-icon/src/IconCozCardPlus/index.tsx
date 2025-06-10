import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozCardPlusComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_card_plus${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M18 1C18.5523 1 19 1.44772 19 2V5H22C22.5523 5 23 5.44772 23 6C23 6.55228 22.5523 7 22 7H19V10C19 10.5523 18.5523 11 18 11C17.4477 11 17 10.5523 17 10V7H14C13.4477 7 13 6.55228 13 6C13 5.44772 13.4477 5 14 5H17V2C17 1.44772 17.4477 1 18 1Z"/><path d="M3 6L3 20H21V8.5H22C22.3556 8.5 22.6938 8.42578 23 8.29198V20C23 21.1046 22.1046 22 21 22H3C1.89543 22 1 21.1046 1 20V6C1 4.89543 1.89543 4 3 4L12.4998 4C11.8927 4.45611 11.5 5.1822 11.5 6L3 6Z"/><path d="M6 11C6 10.4477 6.44772 10 7 10L13 10C13.5523 10 14 10.4477 14 11 14 11.5523 13.5523 12 13 12L7 12C6.44772 12 6 11.5523 6 11zM7 15C6.44772 15 6 15.4477 6 16 6 16.5523 6.44772 17 7 17H17C17.5523 17 18 16.5523 18 16 18 15.4477 17.5523 15 17 15H7z"/></svg>;
}

const IconCozCardPlus = React.forwardRef(IconCozCardPlusComponent);
export default IconCozCardPlus;
