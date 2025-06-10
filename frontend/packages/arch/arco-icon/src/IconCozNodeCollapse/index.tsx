import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozNodeCollapseComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_node_collapse${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M6.1783 1.6652C5.77247 1.29059 5.13982 1.3159 4.76521 1.72172 4.39061 2.12754 4.41591 2.7602 4.82173 3.1348L11.3217 9.1348C11.7048 9.4884 12.2952 9.4884 12.6783 9.1348L19.1783 3.1348C19.5841 2.7602 19.6094 2.12754 19.2348 1.72172 18.8602 1.3159 18.2276 1.29059 17.8217 1.6652L12 7.03909 6.1783 1.6652zM17.8217 22.3348C18.2275 22.7094 18.8602 22.6841 19.2348 22.2783 19.6094 21.8725 19.5841 21.2398 19.1783 20.8652L12.6783 14.8652C12.2952 14.5116 11.7048 14.5116 11.3217 14.8652L4.82173 20.8652C4.4159 21.2398 4.3906 21.8725 4.7652 22.2783 5.13981 22.6841 5.77246 22.7094 6.17828 22.3348L12 16.9609 17.8217 22.3348z"/></svg>;
}

const IconCozNodeCollapse = React.forwardRef(IconCozNodeCollapseComponent);
export default IconCozNodeCollapse;
