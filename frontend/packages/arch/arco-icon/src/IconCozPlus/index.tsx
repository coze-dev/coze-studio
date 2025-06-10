import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozPlusComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_plus${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 25 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M11.1769 19.5C11.1769 20.0523 11.6246 20.5 12.1769 20.5C12.7292 20.5 13.1769 20.0523 13.1769 19.5V13H19.6769C20.2292 13 20.6769 12.5523 20.6769 12C20.6769 11.4477 20.2292 11 19.6769 11H13.1769V4.5C13.1769 3.94772 12.7292 3.5 12.1769 3.5C11.6246 3.5 11.1769 3.94772 11.1769 4.5V11H4.67688C4.1246 11 3.67688 11.4477 3.67688 12C3.67688 12.5523 4.1246 13 4.67688 13H11.1769V19.5Z"/></svg>;
}

const IconCozPlus = React.forwardRef(IconCozPlusComponent);
export default IconCozPlus;
