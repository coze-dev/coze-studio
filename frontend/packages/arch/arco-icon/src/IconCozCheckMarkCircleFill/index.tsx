import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozCheckMarkCircleFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_check_mark_circle_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M11.9998 23C5.92397 23 0.999756 18.0758 0.999756 12C0.999756 5.92425 5.92397 1.00003 11.9998 1.00003C18.0755 1.00003 22.9998 5.92425 22.9998 12C22.9998 18.0758 18.0755 23 11.9998 23ZM7.29265 13.1214C6.90212 12.7309 6.90212 12.0978 7.29265 11.7072C7.68317 11.3167 8.31634 11.3167 8.70686 11.7072L10.8282 13.8285L15.7779 8.8788C16.1685 8.48828 16.8016 8.48828 17.1921 8.8788C17.5827 9.26932 17.5827 9.90249 17.1921 10.293L11.5353 15.9499C11.1448 16.3404 10.5116 16.3404 10.1211 15.9499L7.29265 13.1214Z"/></svg>;
}

const IconCozCheckMarkCircleFill = React.forwardRef(IconCozCheckMarkCircleFillComponent);
export default IconCozCheckMarkCircleFill;
