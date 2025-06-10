import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozCongifureComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_congifure${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 25 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M18.561 11.4466C18.1705 11.8371 17.5373 11.8371 17.1468 11.4466L12.9041 7.20396C12.5136 6.81344 12.5136 6.18027 12.9041 5.78975L17.1468 1.5471C17.5373 1.15658 18.1705 1.15658 18.561 1.5471L22.8036 5.78974C23.1941 6.18027 23.1941 6.81343 22.8036 7.20396L18.561 11.4466zM20.6823 6.49685L17.8539 9.32528 15.0254 6.49685 17.8539 3.66842 20.6823 6.49685zM2.35388 2.99993C2.35388 2.44765 2.8016 1.99993 3.35388 1.99993H10.3539C10.9062 1.99993 11.3539 2.44765 11.3539 2.99993V9.99993C11.3539 10.5522 10.9062 10.9999 10.3539 10.9999H3.35388C2.8016 10.9999 2.35388 10.5522 2.35388 9.99993V2.99993zM4.35388 8.99993V3.99993H9.35388V8.99993H4.35388zM22.3539 20.9999C22.3539 21.5522 21.9062 21.9999 21.3539 21.9999H14.3539C13.8016 21.9999 13.3539 21.5522 13.3539 20.9999V13.9999C13.3539 13.4476 13.8016 12.9999 14.3539 12.9999H21.3539C21.9062 12.9999 22.3539 13.4476 22.3539 13.9999V20.9999zM20.3539 14.9999V19.9999H15.3539V14.9999H20.3539zM3.35388 12.9999C2.8016 12.9999 2.35388 13.4476 2.35388 13.9999V20.9999C2.35388 21.5522 2.8016 21.9999 3.35388 21.9999H10.3539C10.9062 21.9999 11.3539 21.5522 11.3539 20.9999V13.9999C11.3539 13.4477 10.9062 12.9999 10.3539 12.9999H3.35388zM4.35388 14.9999V19.9999H9.35388V14.9999H4.35388z"/></svg>;
}

const IconCozCongifure = React.forwardRef(IconCozCongifureComponent);
export default IconCozCongifure;
