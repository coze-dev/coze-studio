import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozWrenchFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_wrench_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M3.80883 13.5711C1.47734 11.2396 1.16213 7.65538 2.86318 4.98515L7.40353 9.52549L9.52485 7.40417L4.9842 2.86352C7.6546 1.16126 11.2399 1.47612 13.5718 3.80809C15.4291 5.66541 16.0069 8.31773 15.3051 10.6697L21.5091 16.8736C22.2901 17.6546 22.2901 18.9209 21.5091 19.702L19.7027 21.5083C18.9217 22.2893 17.6554 22.2893 16.8743 21.5083L10.6704 15.3044C8.31849 16.0062 5.66615 15.4284 3.80883 13.5711Z"/></svg>;
}

const IconCozWrenchFill = React.forwardRef(IconCozWrenchFillComponent);
export default IconCozWrenchFill;
