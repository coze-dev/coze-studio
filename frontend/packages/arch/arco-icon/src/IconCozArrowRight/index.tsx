import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozArrowRightComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_arrow_right${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 25 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M10.3485 19.7781L17.4195 12.7071C17.8101 12.3165 17.8101 11.6834 17.4195 11.2929L10.3485 4.22179C9.95794 3.83126 9.32477 3.83126 8.93425 4.22179C8.54373 4.61231 8.54373 5.24548 8.93425 5.636L15.2982 12L8.93425 18.3639C8.54373 18.7544 8.54373 19.3876 8.93425 19.7781C9.32478 20.1687 9.95794 20.1687 10.3485 19.7781Z"/></svg>;
}

const IconCozArrowRight = React.forwardRef(IconCozArrowRightComponent);
export default IconCozArrowRight;
