import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozMinusComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_minus${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 25 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M3.68204 11.8978C3.67863 11.9314 3.67688 11.9655 3.67688 12C3.67688 12.5523 4.1246 13 4.67688 13H19.6769C20.2292 13 20.6769 12.5523 20.6769 12C20.6769 11.9655 20.6751 11.9314 20.6717 11.8978C20.6205 11.3935 20.1946 11 19.6769 11H4.67688C4.64236 11 4.60825 11.0017 4.57464 11.0052C4.104 11.053 3.72984 11.4271 3.68204 11.8978Z"/></svg>;
}

const IconCozMinus = React.forwardRef(IconCozMinusComponent);
export default IconCozMinus;
