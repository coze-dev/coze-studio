import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozCompareComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_compare${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M13 3C13 2.44772 12.5523 2 12 2 11.4477 2 11 2.44772 11 3V4.75C11 5.30228 11.4477 5.75 12 5.75 12.5523 5.75 13 5.30228 13 4.75V3zM21 3C22.1046 3 23 3.89543 23 5V19C23 20.1046 22.1046 21 21 21H15.5C14.9477 21 14.5 20.5523 14.5 20 14.5 19.4477 14.9477 19 15.5 19H21V5H15.5C14.9477 5 14.5 4.55228 14.5 4 14.5 3.44772 14.9477 3 15.5 3H21zM12 7.25C12.5523 7.25 13 7.69772 13 8.25V10.25C13 10.8023 12.5523 11.25 12 11.25 11.4477 11.25 11 10.8023 11 10.25V8.25C11 7.69772 11.4477 7.25 12 7.25zM13 13.75C13 13.1977 12.5523 12.75 12 12.75 11.4477 12.75 11 13.1977 11 13.75V15.75C11 16.3023 11.4477 16.75 12 16.75 12.5523 16.75 13 16.3023 13 15.75V13.75zM12 18.25C12.5523 18.25 13 18.6977 13 19.25V21C13 21.5523 12.5523 22 12 22 11.4477 22 11 21.5523 11 21V19.25C11 18.6977 11.4477 18.25 12 18.25zM3 3C1.89543 3 1 3.89543 1 5V19C1 20.1046 1.89543 21 3 21H8.5C9.05228 21 9.5 20.5523 9.5 20 9.5 19.4477 9.05228 19 8.5 19H3V5H8.5C9.05228 5 9.5 4.55228 9.5 4 9.5 3.44772 9.05228 3 8.5 3H3z"/></svg>;
}

const IconCozCompare = React.forwardRef(IconCozCompareComponent);
export default IconCozCompare;
