import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozProperSubsetComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_proper_subset${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M4 12C4 7.85786 7.35786 4.5 11.5 4.5H18C18.5523 4.5 19 4.94772 19 5.5C19 6.05228 18.5523 6.5 18 6.5H11.5C8.46243 6.5 6 8.96243 6 12C6 15.0376 8.46243 17.5 11.5 17.5H18C18.5523 17.5 19 17.9477 19 18.5C19 19.0523 18.5523 19.5 18 19.5H11.5C7.35786 19.5 4 16.1421 4 12Z"/></svg>;
}

const IconCozProperSubset = React.forwardRef(IconCozProperSubsetComponent);
export default IconCozProperSubset;
