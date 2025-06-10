import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozCheckMarkCircleFillPaletteComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = false, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_check_mark_circle_fill_palette${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M0.999756 12C0.999756 18.0758 5.92397 23 11.9998 23C18.0755 23 22.9998 18.0758 22.9998 12C22.9998 5.92425 18.0755 1.00003 11.9998 1.00003C5.92397 1.00003 0.999756 5.92425 0.999756 12Z" fill={useCurrentColor ? 'currentColor' : 'currentColor'}/><path d="M7.29265 11.7072C6.90212 12.0978 6.90212 12.7309 7.29265 13.1214L10.1211 15.9499C10.5116 16.3404 11.1448 16.3404 11.5353 15.9499L17.1921 10.293C17.5827 9.90249 17.5827 9.26932 17.1921 8.8788C16.8016 8.48828 16.1685 8.48828 15.7779 8.8788L10.8282 13.8285L8.70686 11.7072C8.31634 11.3167 7.68317 11.3167 7.29265 11.7072Z" fill={useCurrentColor ? 'currentColor' : '#fff'}/></svg>;
}

const IconCozCheckMarkCircleFillPalette = React.forwardRef(IconCozCheckMarkCircleFillPaletteComponent);
export default IconCozCheckMarkCircleFillPalette;
