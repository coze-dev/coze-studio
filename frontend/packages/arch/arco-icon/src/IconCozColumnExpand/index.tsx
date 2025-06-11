import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozColumnExpandComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_column_expand${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M9.13519 6.17829C9.5098 5.77246 9.48449 5.13981 9.07867 4.7652 8.67285 4.3906 8.04019 4.4159 7.66559 4.82173L1.66559 11.3217C1.31199 11.7048 1.31199 12.2952 1.66559 12.6783L7.66559 19.1783C8.04019 19.5841 8.67285 19.6094 9.07867 19.2348 9.48449 18.8602 9.5098 18.2275 9.13519 17.8217L3.7613 12 9.13519 6.17829zM14.8648 6.17829C14.4902 5.77246 14.5155 5.13981 14.9213 4.7652 15.3272 4.3906 15.9598 4.4159 16.3344 4.82173L22.3344 11.3217C22.688 11.7048 22.688 12.2952 22.3344 12.6783L16.3344 19.1783C15.9598 19.5841 15.3272 19.6094 14.9213 19.2348 14.5155 18.8602 14.4902 18.2275 14.8648 17.8217L20.2387 12 14.8648 6.17829z"/></svg>;
}

const IconCozColumnExpand = React.forwardRef(IconCozColumnExpandComponent);
export default IconCozColumnExpand;
