import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozDiamondFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_diamond_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M5.59813 2.70822C5.24001 2.70822 4.90923 2.89973 4.73092 3.21029L1.38035 9.04584C1.17027 9.41171 1.21243 9.87007 1.4857 10.1915L11.6952 22.1998C11.8549 22.3876 12.1449 22.3876 12.3046 22.1998L22.5141 10.1915C22.7874 9.87007 22.8295 9.41171 22.6195 9.04584L19.2689 3.21029C19.0906 2.89973 18.7598 2.70822 18.4017 2.70822H5.59813ZM7.9999 8.38351C7.44762 8.38351 6.9999 8.83123 6.9999 9.38351C6.9999 9.9358 7.44762 10.3835 7.9999 10.3835H15.9999C16.5522 10.3835 16.9999 9.9358 16.9999 9.38351C16.9999 8.83123 16.5522 8.38351 15.9999 8.38351H7.9999Z"/></svg>;
}

const IconCozDiamondFill = React.forwardRef(IconCozDiamondFillComponent);
export default IconCozDiamondFill;
