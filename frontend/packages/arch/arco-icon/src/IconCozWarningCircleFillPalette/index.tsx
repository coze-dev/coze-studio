import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozWarningCircleFillPaletteComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = false, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_warning_circle_fill_palette${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23Z" fill={useCurrentColor ? 'currentColor' : 'currentColor'}/><path d="M12 7C11.4477 7 11 7.44772 11 8V13C11 13.5523 11.4477 14 12 14 12.5523 14 13 13.5523 13 13V8C13 7.44772 12.5523 7 12 7zM12 15C11.4477 15 11 15.4477 11 16 11 16.5523 11.4477 17 12 17 12.5523 17 13 16.5523 13 16 13 15.4477 12.5523 15 12 15z" fill={useCurrentColor ? 'currentColor' : '#fff'}/></svg>;
}

const IconCozWarningCircleFillPalette = React.forwardRef(IconCozWarningCircleFillPaletteComponent);
export default IconCozWarningCircleFillPalette;
