import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozElementOfComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_element_of${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M4 12C4 7.85786 7.35786 4.5 11.5 4.5H18C18.5523 4.5 19 4.94772 19 5.5C19 6.05228 18.5523 6.5 18 6.5H11.5C8.80393 6.5 6.56094 8.43988 6.09069 11H18C18.5523 11 19 11.4477 19 12C19 12.5523 18.5523 13 18 13H6.09069C6.56094 15.5601 8.80393 17.5 11.5 17.5H18C18.5523 17.5 19 17.9477 19 18.5C19 19.0523 18.5523 19.5 18 19.5H11.5C7.35786 19.5 4 16.1421 4 12Z"/></svg>;
}

const IconCozElementOf = React.forwardRef(IconCozElementOfComponent);
export default IconCozElementOf;
