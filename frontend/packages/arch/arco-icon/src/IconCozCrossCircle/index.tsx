import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozCrossCircleComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_cross_circle${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M10.5858 12L8.46449 9.87868C8.07396 9.48816 8.07396 8.85499 8.46449 8.46447C8.85501 8.07394 9.48818 8.07394 9.8787 8.46447L12 10.5858L14.1213 8.46447C14.5119 8.07394 15.145 8.07394 15.5356 8.46447C15.9261 8.85499 15.9261 9.48816 15.5356 9.87868L13.4142 12L15.5356 14.1213C15.9261 14.5118 15.9261 15.145 15.5356 15.5355C15.145 15.9261 14.5119 15.9261 14.1213 15.5355L12 13.4142L9.8787 15.5355C9.48818 15.9261 8.85501 15.9261 8.46449 15.5355C8.07396 15.145 8.07396 14.5118 8.46449 14.1213L10.5858 12Z"/><path d="M1 12C1 18.0751 5.92487 23 12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12ZM21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"/></svg>;
}

const IconCozCrossCircle = React.forwardRef(IconCozCrossCircleComponent);
export default IconCozCrossCircle;
