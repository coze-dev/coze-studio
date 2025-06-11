import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozThumbsupFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_thumbsup_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M14.9985 7.9986H19.2875C22.2715 7.9986 22.957 10.6326 22.2715 12.6061L19.2875 20.4611C19.0355 21.3746 18.196 22.0086 17.2375 22.0086H5.99249C5.4402 22.0086 4.99249 21.5609 4.99249 21.0086 4.99249 17.0053 4.99248 13.0019 4.99249 8.9986 4.99249 8.44632 5.4402 7.9986 5.99249 7.9986H6.51999C6.68051 7.99866 6.83869 7.96007 6.98116 7.8861 7.12362 7.81212 7.24618 7.70494 7.33849 7.5736L11.4895 1.6681C11.7705 1.2211 12.5295.878105 13.3375 1.2466 14.55 1.7986 16.002 3.0041 16.002 5.0016 16.002 5.7546 15.667 6.7536 14.9985 7.9986zM3.48798 21.0001V8.93666C3.48798 8.43666 3.09854 7.95256 2.48798 7.93666 1.91194 7.92166 1.48798 8.43666 1.48798 8.93666V21.0001C1.48798 21.5001 1.88641 22.0001 2.48798 22.0001 3.08954 22.0001 3.48798 21.5001 3.48798 21.0001z"/></svg>;
}

const IconCozThumbsupFill = React.forwardRef(IconCozThumbsupFillComponent);
export default IconCozThumbsupFill;
