import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozArrowUpFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_arrow_up_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 25 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M13.5962 7.11603C13.5945 7.11431 13.5928 7.11261 13.5911 7.1109L12.884 6.40379C12.7132 6.23294 12.4959 6.13683 12.2728 6.11548C12.1682 6.10547 12.0623 6.11188 11.9594 6.13471C11.78 6.17451 11.6094 6.2642 11.4698 6.40379L10.7627 7.1109C10.761 7.11259 10.7593 7.11428 10.7576 7.11597L4.39873 13.4749C4.0082 13.8654 4.0082 14.4986 4.39873 14.8891L5.10583 15.5962C5.49636 15.9867 6.12952 15.9867 6.52005 15.5962L12.1769 9.93935L17.8337 15.5962C18.2242 15.9867 18.8574 15.9867 19.2479 15.5962L19.955 14.8891C20.3456 14.4986 20.3456 13.8654 19.955 13.4749L13.5962 7.11603Z"/></svg>;
}

const IconCozArrowUpFill = React.forwardRef(IconCozArrowUpFillComponent);
export default IconCozArrowUpFill;
