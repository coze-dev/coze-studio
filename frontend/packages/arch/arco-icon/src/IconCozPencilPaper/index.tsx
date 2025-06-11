import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozPencilPaperComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_pencil_paper${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M5 3H19V13.2575L19.268 12.9895C19.7545 12.503 20.3666 12.2185 21 12.1361V3C21 1.89543 20.1046 1 19 1H5C3.89543 1 3 1.89543 3 3V21C3 22.1046 3.89543 23 5 23H11.1083L11.3504 21.6426C11.39 21.4204 11.4553 21.2048 11.5441 21H5L5 3Z"/><path d="M8 12C7.44772 12 7 12.4477 7 13 7 13.5523 7.44772 14 8 14H12C12.5523 14 13 13.5523 13 13 13 12.4477 12.5523 12 12 12H8zM7 8C7 7.44772 7.44772 7 8 7H16C16.5523 7 17 7.44772 17 8 17 8.55228 16.5523 9 16 9H8C7.44772 9 7 8.55228 7 8zM22.4499 14.0502C21.8642 13.4644 20.9144 13.4644 20.3286 14.0502L19.268 15.1108 21.3893 17.2322 22.4499 16.1715C23.0357 15.5857 23.0357 14.636 22.4499 14.0502zM15.3466 23.2749L20.3286 18.2928 18.2073 16.1715 13.2137 21.1651C13.0121 21.3667 12.8772 21.6253 12.8271 21.906L12.4914 23.788C12.4817 23.8426 12.4992 23.8985 12.5385 23.9377 12.5772 23.9764 12.6322 23.9941 12.6862 23.9851L14.5771 23.6706C14.8686 23.6222 15.1376 23.4838 15.3466 23.2749z"/></svg>;
}

const IconCozPencilPaper = React.forwardRef(IconCozPencilPaperComponent);
export default IconCozPencilPaper;
