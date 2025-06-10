import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozSortPositiveComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_sort_positive${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M6.01627 21.9999C5.66223 22.0085 5.31465 21.8283 5.12511 21.5L1.62511 15.4378C1.34897 14.9595 1.51284 14.3479 1.99113 14.0718 2.46943 13.7957 3.08102 13.9595 3.35716 14.4378L5.00005 17.2834 5.00005 3C5.00005 2.44772 5.44777 2 6.00005 2 6.55234 2 7.00005 2.44772 7.00005 3L7.00005 21C7.00005 21.5469 6.56108 21.9912 6.01627 21.9999zM9.00005 19C9.00005 18.4477 9.44777 18 10.0001 18H17.0001C17.5523 18 18.0001 18.4477 18.0001 19 18.0001 19.5523 17.5523 20 17.0001 20H10.0001C9.44777 20 9.00005 19.5523 9.00005 19zM9.00005 12C9.00005 11.4477 9.44777 11 10.0001 11H19.0001C19.5523 11 20.0001 11.4477 20.0001 12 20.0001 12.5523 19.5523 13 19.0001 13H10.0001C9.44777 13 9.00005 12.5523 9.00005 12zM10.0001 4C9.44777 4 9.00005 4.44772 9.00005 5 9.00005 5.55228 9.44777 6 10.0001 6L21.0001 6C21.5523 6 22.0001 5.55229 22.0001 5 22.0001 4.44772 21.5523 4 21.0001 4L10.0001 4z"/></svg>;
}

const IconCozSortPositive = React.forwardRef(IconCozSortPositiveComponent);
export default IconCozSortPositive;
