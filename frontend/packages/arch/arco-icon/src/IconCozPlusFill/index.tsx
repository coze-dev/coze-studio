import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozPlusFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_plus_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 25 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M11.6769 3.5C11.1246 3.5 10.6769 3.94771 10.6769 4.5V10.5H4.67688C4.1246 10.5 3.67688 10.9477 3.67688 11.5V12.5C3.67688 13.0523 4.1246 13.5 4.67688 13.5H10.6769V19.5C10.6769 20.0523 11.1246 20.5 11.6769 20.5H12.6769C13.2292 20.5 13.6769 20.0523 13.6769 19.5V13.5H19.6769C20.2292 13.5 20.6769 13.0523 20.6769 12.5V11.5C20.6769 10.9477 20.2292 10.5 19.6769 10.5H13.6769V4.5C13.6769 3.94771 13.2292 3.5 12.6769 3.5H11.6769Z"/></svg>;
}

const IconCozPlusFill = React.forwardRef(IconCozPlusFillComponent);
export default IconCozPlusFill;
