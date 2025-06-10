import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozSideExpandComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_side_expand${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M10 4C9.44771 4 9 4.44772 9 5 9 5.55228 9.44771 6 10 6H22C22.5523 6 23 5.55228 23 5 23 4.44772 22.5523 4 22 4H10zM22 11H10C9.44771 11 9 11.4477 9 12 9 12.5523 9.44771 13 10 13H22C22.5523 13 23 12.5523 23 12 23 11.4477 22.5523 11 22 11zM9 19C9 18.4477 9.44771 18 10 18H22C22.5523 18 23 18.4477 23 19 23 19.5523 22.5523 20 22 20H10C9.44771 20 9 19.5523 9 19zM6.70711 8.70711C7.09763 8.31658 7.09763 7.68342 6.70711 7.29289 6.31658 6.90237 5.68342 6.90237 5.29289 7.29289L1.29289 11.2929C.902369 11.6834.902369 12.3166 1.29289 12.7071L5.29289 16.7071C5.68342 17.0976 6.31658 17.0976 6.70711 16.7071 7.09763 16.3166 7.09763 15.6834 6.70711 15.2929L3.41421 12 6.70711 8.70711z"/></svg>;
}

const IconCozSideExpand = React.forwardRef(IconCozSideExpandComponent);
export default IconCozSideExpand;
