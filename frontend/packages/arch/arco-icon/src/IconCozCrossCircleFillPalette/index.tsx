import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozCrossCircleFillPaletteComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = false, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_cross_circle_fill_palette${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M1 12C1 18.0751 5.92487 23 12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12Z" fill={useCurrentColor ? 'currentColor' : 'currentColor'}/><path d="M10.5858 12L8.46452 9.87868C8.074 9.48815 8.074 8.85499 8.46452 8.46446C8.85505 8.07394 9.48821 8.07394 9.87874 8.46446L12.0001 10.5858L14.1214 8.46446C14.5119 8.07394 15.1451 8.07394 15.5356 8.46446C15.9261 8.85499 15.9261 9.48815 15.5356 9.87868L13.4143 12L15.5356 14.1213C15.9261 14.5118 15.9261 15.145 15.5356 15.5355C15.1451 15.9261 14.5119 15.9261 14.1214 15.5355L12.0001 13.4142L9.87874 15.5355C9.48821 15.9261 8.85505 15.9261 8.46452 15.5355C8.074 15.145 8.074 14.5118 8.46452 14.1213L10.5858 12Z" fill={useCurrentColor ? 'currentColor' : '#fff'}/></svg>;
}

const IconCozCrossCircleFillPalette = React.forwardRef(IconCozCrossCircleFillPaletteComponent);
export default IconCozCrossCircleFillPalette;
