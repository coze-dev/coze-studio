import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozArrowRightFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_arrow_right_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 25 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M17.0609 13.4193C17.0626 13.4176 17.0643 13.4159 17.066 13.4142L17.7731 12.7071C17.944 12.5362 18.0401 12.3189 18.0614 12.0958C18.0715 11.9912 18.065 11.8854 18.0422 11.7824C18.0024 11.603 17.9127 11.4324 17.7731 11.2928L17.066 10.5857C17.0643 10.584 17.0626 10.5823 17.0609 10.5807L10.7021 4.22179C10.3115 3.83126 9.67837 3.83126 9.28784 4.22179L8.58074 4.92889C8.19021 5.31942 8.19021 5.95258 8.58074 6.34311L14.2376 11.9999L8.58074 17.6568C8.19021 18.0473 8.19021 18.6805 8.58074 19.071L9.28784 19.7781C9.67837 20.1686 10.3115 20.1686 10.7021 19.7781L17.0609 13.4193Z"/></svg>;
}

const IconCozArrowRightFill = React.forwardRef(IconCozArrowRightFillComponent);
export default IconCozArrowRightFill;
