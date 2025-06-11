import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozQuotationFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_quotation_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M8 3C4.68629 3 2 5.68629 2 9V11L2 11.0029V17C2 18.6569 3.34315 20 5 20H8C9.65686 20 11 18.6569 11 17V14C11 12.3432 9.65686 11 8 11H4V9C4 6.79086 5.79086 5 8 5H8.5C9.05228 5 9.5 4.55228 9.5 4 9.5 3.44772 9.05228 3 8.5 3H8zM19 3C15.6863 3 13 5.68629 13 9V11L13 11.003V17C13 18.6569 14.3432 20 16 20H19C20.6569 20 22 18.6569 22 17V14C22 12.3432 20.6569 11 19 11H15V9C15 6.79086 16.7909 5 19 5H19.5C20.0523 5 20.5 4.55228 20.5 4 20.5 3.44772 20.0523 3 19.5 3H19z"/></svg>;
}

const IconCozQuotationFill = React.forwardRef(IconCozQuotationFillComponent);
export default IconCozQuotationFill;
