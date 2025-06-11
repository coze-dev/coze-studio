import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozEarthFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_earth_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M22.9552 13C22.5162 17.8707 18.9024 21.8259 14.1989 22.7802 15.7399 20.9663 16.8349 17.3054 16.9829 13H22.9552zM22.9552 11C22.5162 6.12932 18.9024 2.17414 14.1991 1.21984 15.74 3.0338 16.8349 6.69468 16.9829 11H22.9552zM14.9878 11C14.8503 5.40536 13.5704 1.01858 12.01 1L11.9901 1C10.4296 1.01858 9.14972 5.40536 9.01223 11H14.9878zM9.01224 13C9.15003 18.6065 10.4351 22.9999 12 22.9999 13.5649 22.9999 14.85 18.6065 14.9878 13H9.01224zM7.01712 13C7.16512 17.3054 8.26013 20.9663 9.80107 22.7802 5.09765 21.8259 1.48377 17.8707 1.04484 13H7.01712zM7.01712 11C7.1651 6.69468 8.26006 3.03379 9.80096 1.21984 5.0976 2.17413 1.48376 6.12932 1.04484 11H7.01712zM1.00008 11.9565C1.00003 11.971 1 11.9855 1 12 1 12.0145 1.00003 12.029 1.00008 12.0435V11.9565z"/></svg>;
}

const IconCozEarthFill = React.forwardRef(IconCozEarthFillComponent);
export default IconCozEarthFill;
