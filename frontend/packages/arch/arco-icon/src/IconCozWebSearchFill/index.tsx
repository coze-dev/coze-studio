import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozWebSearchFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_web_search_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M2 4C2 2.89543 2.89543 2 4 2H20C21.1046 2 22 2.89543 22 4V20C22 20.1792 21.9764 20.3529 21.9322 20.5182L19.3099 17.8958C19.7471 17.2021 20 16.3806 20 15.5C20 13.0147 17.9853 11 15.5 11C13.0147 11 11 13.0147 11 15.5C11 17.9853 13.0147 20 15.5 20C16.3805 20 17.2019 19.7471 17.8956 19.31L20.5179 21.9323C20.3527 21.9765 20.1791 22 20 22H4C2.89543 22 2 21.1046 2 20V4ZM5 6C5 5.44772 5.44772 5 6 5H18C18.5523 5 19 5.44772 19 6C19 6.55228 18.5523 7 18 7H6C5.44772 7 5 6.55228 5 6ZM6 9C5.44772 9 5 9.44772 5 10C5 10.5523 5.44772 11 6 11H10C10.5523 11 11 10.5523 11 10C11 9.44772 10.5523 9 10 9H6Z"/><path d="M18 15.5C18 16.8807 16.8807 18 15.5 18C14.1193 18 13 16.8807 13 15.5C13 14.1193 14.1193 13 15.5 13C16.8807 13 18 14.1193 18 15.5Z"/></svg>;
}

const IconCozWebSearchFill = React.forwardRef(IconCozWebSearchFillComponent);
export default IconCozWebSearchFill;
