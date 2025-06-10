import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozThumbdownFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_thumbdown_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M2 2C1.44772 2 1 2.44772 1 3V15C1 15.5523 1.44772 16 2 16 2.55228 16 3 15.5523 3 15V3C3 2.44772 2.55228 2 2 2zM18.8576 16.065H14.5515C15.223 17.3147 15.5587 18.3176 15.5587 19.0738 15.5587 21.079 14.1014 22.2892 12.884 22.8436 12.0724 23.2132 11.311 22.8691 11.0289 22.4203L6.86122 16.4916C6.67323 16.2242 6.36681 16.065 6.03992 16.065H5.00831C4.73108 16.065 4.50635 15.8403 4.50635 15.563V2.50196C4.50635 2.22474 4.73108 2 5.00831 2H16.7994C17.7614 2 18.6044 2.63631 18.8576 3.55353L21.8532 11.4395C22.5412 13.4208 21.8532 16.065 18.8576 16.065z"/></svg>;
}

const IconCozThumbdownFill = React.forwardRef(IconCozThumbdownFillComponent);
export default IconCozThumbdownFill;
