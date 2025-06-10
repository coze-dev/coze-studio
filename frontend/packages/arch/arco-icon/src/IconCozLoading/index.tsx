import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozLoadingComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_loading${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23C18.0751 23 23 18.0751 23 12C23 8.96243 21.7688 6.21243 19.7782 4.22182C19.3876 3.8313 18.7545 3.83134 18.3639 4.22186C17.9734 4.61239 17.9734 5.24555 18.3639 5.63608L18.3703 5.64239C19.9953 7.27056 21 9.51795 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02999 7.02853 3.00091 11.9983 3C11.9989 3 11.9994 3 12 3C12.5523 3 13 2.55228 13 2C13 1.44772 12.5523 1 12 1C12 1 12 1 12 1Z"/></svg>;
}

const IconCozLoading = React.forwardRef(IconCozLoadingComponent);
export default IconCozLoading;
