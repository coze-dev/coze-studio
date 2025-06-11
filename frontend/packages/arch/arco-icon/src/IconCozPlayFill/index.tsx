import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozPlayFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_play_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 25 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M19.5283 11.1341C20.1949 11.519 20.1949 12.4812 19.5283 12.8661L7.8313 19.6194C7.16463 20.0043 6.3313 19.5231 6.3313 18.7533L6.3313 5.24685C6.3313 4.47705 7.16463 3.99593 7.8313 4.38083L19.5283 11.1341Z"/></svg>;
}

const IconCozPlayFill = React.forwardRef(IconCozPlayFillComponent);
export default IconCozPlayFill;
