import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozQualityEnhanceFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_quality_enhance_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M15.628 14.4766H14.7751V10.0551H15.628C16.7802 10.0551 17.4586 10.8137 17.4586 12.2165V12.2269C17.4586 13.7232 16.8201 14.4766 15.628 14.4766Z"/><path fillRule="evenodd" clipRule="evenodd" d="M5 2C2.79086 2 1 3.79086 1 6V18C1 20.2091 2.79086 22 5 22H19C21.2091 22 23 20.2091 23 18V6C23 3.79086 21.2091 2 19 2H5ZM5.32324 8.51721V16.0145H7.15377V12.9958H10.0218V16.0145H11.8473V8.51721H10.0218V11.4631H7.15377V8.51721H5.32324ZM12.9446 8.51721V16.0145H15.8675C18.0372 16.0145 19.319 14.6169 19.319 12.2217V12.2113C19.319 9.82651 18.0372 8.51721 15.8675 8.51721H12.9446Z"/></svg>;
}

const IconCozQualityEnhanceFill = React.forwardRef(IconCozQualityEnhanceFillComponent);
export default IconCozQualityEnhanceFill;
