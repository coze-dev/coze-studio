import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozCheckMarkCircleComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_check_mark_circle${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M7.29265 13.1214C6.90212 12.7309 6.90212 12.0978 7.29265 11.7072C7.68317 11.3167 8.31634 11.3167 8.70686 11.7072L10.8282 13.8285L15.7779 8.8788C16.1685 8.48828 16.8016 8.48828 17.1921 8.8788C17.5827 9.26932 17.5827 9.90249 17.1921 10.293L11.5353 15.9499C11.1448 16.3404 10.5116 16.3404 10.1211 15.9499L7.29265 13.1214Z"/><path fillRule="evenodd" clipRule="evenodd" d="M23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12ZM21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"/></svg>;
}

const IconCozCheckMarkCircle = React.forwardRef(IconCozCheckMarkCircleComponent);
export default IconCozCheckMarkCircle;
