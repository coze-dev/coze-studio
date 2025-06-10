import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozSingleAgentComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_single_agent${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M11.107 15.6C11.107 16.1523 11.5547 16.6 12.107 16.6H12.694C13.2463 16.6 13.694 16.1523 13.694 15.6V8.5C13.694 7.94772 13.2463 7.5 12.694 7.5H12.0117C11.6824 7.5 11.3581 7.58134 11.0677 7.73681L9.37903 8.64093C8.92226 8.88548 8.72793 9.43841 8.93126 9.91496L9.04499 10.1815C9.23502 10.6269 9.77404 10.8027 10.1901 10.555L11.107 10.009V15.6Z"/><path fillRule="evenodd" clipRule="evenodd" d="M1.49283 7.4924C2.00254 5.26794 3.80266 3.6894 6.02765 3.18198C7.61653 2.81963 9.67659 2.5 12 2.5C14.3235 2.5 16.3835 2.81963 17.9724 3.18198C20.1974 3.6894 21.9974 5.26792 22.5072 7.49236C22.784 8.70072 23 10.2311 23 12.0655C23 14.1401 22.7238 15.8044 22.3955 17.0496C21.9018 18.9228 20.4106 20.2807 18.531 20.7494C16.9687 21.139 14.7729 21.5 12 21.5C9.22717 21.5 7.03143 21.139 5.46906 20.7494C3.58946 20.2807 2.09814 18.9228 1.60444 17.0496C1.27624 15.8043 1 14.14 1 12.0655C1 10.2312 1.21595 8.70076 1.49283 7.4924ZM3.53839 16.5399C3.25207 15.4535 3 13.9604 3 12.0655C3 10.3894 3.19719 9.00884 3.44231 7.9391C3.75598 6.57018 4.88239 5.49452 6.47234 5.13192C7.94824 4.79533 9.85658 4.5 12 4.5C14.1435 4.5 16.0518 4.79533 17.5277 5.13192C19.1176 5.49451 20.244 6.57015 20.5577 7.93906C20.8028 9.00881 21 10.3894 21 12.0655C21 13.9605 20.7479 15.4535 20.4616 16.5399C20.1709 17.6427 19.2856 18.5 18.0471 18.8089C16.6311 19.162 14.5979 19.5 12 19.5C9.40215 19.5 7.369 19.162 5.95296 18.8089C4.71438 18.5 3.82905 17.6427 3.53839 16.5399Z"/></svg>;
}

const IconCozSingleAgent = React.forwardRef(IconCozSingleAgentComponent);
export default IconCozSingleAgent;
