import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozNodeExpandComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_node_expand${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M17.8217 9.13519C18.2275 9.5098 18.8602 9.48449 19.2348 9.07867 19.6094 8.67285 19.5841 8.04019 19.1783 7.66559L12.6783 1.66559C12.2952 1.31199 11.7048 1.31199 11.3217 1.66559L4.82173 7.66559C4.4159 8.04019 4.3906 8.67285 4.7652 9.07867 5.13981 9.48449 5.77246 9.5098 6.17828 9.13519L12 3.7613 17.8217 9.13519zM17.8217 14.8648C18.2275 14.4902 18.8602 14.5155 19.2348 14.9213 19.6094 15.3272 19.5841 15.9598 19.1783 16.3344L12.6783 22.3344C12.2952 22.688 11.7048 22.688 11.3217 22.3344L4.82173 16.3344C4.4159 15.9598 4.3906 15.3272 4.7652 14.9213 5.13981 14.5155 5.77246 14.4902 6.17828 14.8648L12 20.2387 17.8217 14.8648z"/></svg>;
}

const IconCozNodeExpand = React.forwardRef(IconCozNodeExpandComponent);
export default IconCozNodeExpand;
