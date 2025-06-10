import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozTrashCanComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_trash_can${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M8 4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4H21C21.5523 4 22 4.44772 22 5C22 5.55228 21.5523 6 21 6H20C20 10.6667 20 15.3333 20 20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20C4 15.3333 4 10.6667 4 6H3C2.44772 6 2 5.55228 2 5C2 4.44772 2.44772 4 3 4H8ZM6 6V20H18V6H6ZM10 9C10.5523 9 11 9.44772 11 10V16C11 16.5523 10.5523 17 10 17C9.44772 17 9 16.5523 9 16V10C9 9.44772 9.44772 9 10 9ZM14 9C14.5523 9 15 9.44772 15 10V16C15 16.5523 14.5523 17 14 17C13.4477 17 13 16.5523 13 16V10C13 9.44772 13.4477 9 14 9Z"/></svg>;
}

const IconCozTrashCan = React.forwardRef(IconCozTrashCanComponent);
export default IconCozTrashCan;
