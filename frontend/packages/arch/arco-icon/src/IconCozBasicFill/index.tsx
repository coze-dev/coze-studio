import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozBasicFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_basic_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M6.5 11C8.98528 11 11 8.98528 11 6.5 11 4.01472 8.98528 2 6.5 2 4.01472 2 2 4.01472 2 6.5 2 8.98528 4.01472 11 6.5 11zM17.5 22C19.9853 22 22 19.9853 22 17.5 22 15.0147 19.9853 13 17.5 13 15.0147 13 13 15.0147 13 17.5 13 19.9853 15.0147 22 17.5 22zM15.9262 2.62069C16.4035 1.7931 17.5965 1.7931 18.0738 2.62069L21.832 9.13793C22.3093 9.96552 21.7127 11 20.7583 11H13.2418C12.2873 11 11.6907 9.96552 12.168 9.13793L15.9262 2.62069zM3 13C2.44772 13 2 13.4477 2 14V21C2 21.5523 2.44772 22 3 22H10C10.5523 22 11 21.5523 11 21V14C11 13.4477 10.5523 13 10 13H3z"/></svg>;
}

const IconCozBasicFill = React.forwardRef(IconCozBasicFillComponent);
export default IconCozBasicFill;
