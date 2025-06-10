import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozArrowForwardComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_arrow_forward${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M8.50011 7.00002H18.1214L15.5862 4.4648C15.1957 4.07428 15.1957 3.44113 15.5862 3.05061C15.9767 2.66009 16.6099 2.66009 17.0004 3.05061L21.2428 7.29291C21.438 7.48817 21.5356 7.7441 21.5356 8.00002C21.5356 8.25594 21.438 8.51186 21.2428 8.70713L16.9967 12.9527C16.6079 13.3414 15.9775 13.3414 15.5887 12.9526C15.2006 12.5645 15.1999 11.9354 15.5871 11.5463L18.1214 9.00002H8.73495C6.80195 9.00002 3.73495 10.9807 3.73495 14C3.73495 17.0193 6.80195 19.0199 8.73495 19.0199H12.3733C12.92 19.0199 13.3633 19.4632 13.3633 20.0099C13.3633 20.5567 12.92 21 12.3733 21H8.50011C4.63412 21 1.50011 17.866 1.50011 14C1.50011 10.134 4.63412 7.00002 8.50011 7.00002Z"/></svg>;
}

const IconCozArrowForward = React.forwardRef(IconCozArrowForwardComponent);
export default IconCozArrowForward;
