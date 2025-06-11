import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozAgentFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_agent_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M1.49283 7.4924C2.00254 5.26794 3.80266 3.6894 6.02765 3.18198C7.61653 2.81963 9.67659 2.5 12 2.5C14.3235 2.5 16.3835 2.81963 17.9724 3.18198C20.1974 3.6894 21.9974 5.26792 22.5072 7.49236C22.784 8.70072 23 10.2311 23 12.0655C23 14.1401 22.7238 15.8044 22.3955 17.0496C21.9018 18.9228 20.4106 20.2807 18.531 20.7494C16.9687 21.139 14.7729 21.5 12 21.5C9.22717 21.5 7.03143 21.139 5.46906 20.7494C3.58946 20.2807 2.09814 18.9228 1.60444 17.0496C1.27624 15.8043 1 14.14 1 12.0655C1 10.2312 1.21595 8.70076 1.49283 7.4924ZM6.5 10.9C6.5 10.182 7.08203 9.6 7.8 9.6C8.51797 9.6 9.1 10.182 9.1 10.9V12.7C9.1 13.418 8.51797 14 7.8 14C7.08203 14 6.5 13.418 6.5 12.7V10.9ZM16.1999 9.6C15.4819 9.6 14.8999 10.182 14.8999 10.9V12.7C14.8999 13.418 15.4819 14 16.1999 14C16.9179 14 17.4999 13.418 17.4999 12.7V10.9C17.4999 10.182 16.9179 9.6 16.1999 9.6Z"/></svg>;
}

const IconCozAgentFill = React.forwardRef(IconCozAgentFillComponent);
export default IconCozAgentFill;
