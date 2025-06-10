import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozCrossCircleFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_cross_circle_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23ZM8.46449 9.87868L10.5858 12L8.46449 14.1213C8.07397 14.5118 8.07397 15.145 8.46449 15.5355C8.85502 15.9261 9.48818 15.9261 9.87871 15.5355L12 13.4142L14.1213 15.5355C14.5119 15.9261 15.145 15.9261 15.5356 15.5355C15.9261 15.145 15.9261 14.5118 15.5356 14.1213L13.4142 12L15.5356 9.87868C15.9261 9.48815 15.9261 8.85499 15.5356 8.46446C15.145 8.07394 14.5119 8.07394 14.1213 8.46446L12 10.5858L9.87871 8.46446C9.48818 8.07394 8.85502 8.07394 8.46449 8.46446C8.07397 8.85499 8.07397 9.48815 8.46449 9.87868Z"/></svg>;
}

const IconCozCrossCircleFill = React.forwardRef(IconCozCrossCircleFillComponent);
export default IconCozCrossCircleFill;
