import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozSmartphoneComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_smartphone${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M9 2.5H6V21.5H18V2.5H15V3.5C15 4.05228 14.5523 4.5 14 4.5H10C9.44772 4.5 9 4.05228 9 3.5V2.5ZM6 0.5H18C19 0.5 20 1.5 20 2.5V21.5C20 22.5 19 23.5 18 23.5H6C5 23.5 4 22.5 4 21.5V2.5C4 1.5 5 0.5 6 0.5ZM12 16.5C12.8284 16.5 13.5 17.1716 13.5 18C13.5 18.8284 12.8284 19.5 12 19.5C11.1716 19.5 10.5 18.8284 10.5 18C10.5 17.1716 11.1716 16.5 12 16.5Z"/></svg>;
}

const IconCozSmartphone = React.forwardRef(IconCozSmartphoneComponent);
export default IconCozSmartphone;
