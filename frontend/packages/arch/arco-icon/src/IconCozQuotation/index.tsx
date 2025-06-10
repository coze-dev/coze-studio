import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozQuotationComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_quotation${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M8 3C4.68629 3 2 5.68629 2 9V11L2 11.0029V17C2 18.6569 3.34315 20 5 20H8C9.65686 20 11 18.6569 11 17V14C11 12.3432 9.65686 11 8 11H4V9C4 6.79086 5.79086 5 8 5H8.5C9.05228 5 9.5 4.55228 9.5 4 9.5 3.44772 9.05228 3 8.5 3H8zM8 13H4V17C4 17.5523 4.44772 18 5 18H8C8.55229 18 9 17.5523 9 17V14C9 13.4478 8.55229 13 8 13zM19 3C15.6863 3 13 5.68629 13 9V11L13 11.003V17C13 18.6569 14.3432 20 16 20H19C20.6569 20 22 18.6569 22 17V14C22 12.3432 20.6569 11 19 11H15V9C15 6.79086 16.7909 5 19 5H19.5C20.0523 5 20.5 4.55228 20.5 4 20.5 3.44772 20.0523 3 19.5 3H19zM19 13H15V17C15 17.5523 15.4477 18 16 18H19C19.5523 18 20 17.5523 20 17V14C20 13.4478 19.5523 13 19 13z"/></svg>;
}

const IconCozQuotation = React.forwardRef(IconCozQuotationComponent);
export default IconCozQuotation;
