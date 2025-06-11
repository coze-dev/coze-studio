import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozBotComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_bot${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M6.6001 11C6.6001 10.3373 7.13736 9.80005 7.8001 9.80005 8.46284 9.80005 9.0001 10.3373 9.0001 11V12.6C9.0001 13.2628 8.46284 13.8 7.8001 13.8 7.13736 13.8 6.6001 13.2628 6.6001 12.6V11zM16.2 9.80005C15.5373 9.80005 15 10.3373 15 11V12.6C15 13.2628 15.5373 13.8 16.2 13.8 16.8627 13.8 17.4 13.2628 17.4 12.6V11C17.4 10.3373 16.8627 9.80005 16.2 9.80005z"/><path fillRule="evenodd" clipRule="evenodd" d="M6.02765 3.18198C3.80266 3.6894 2.00254 5.26794 1.49283 7.4924C1.21595 8.70076 1 10.2312 1 12.0655C1 14.14 1.27624 15.8043 1.60444 17.0496C2.09814 18.9228 3.58946 20.2807 5.46906 20.7494C7.03143 21.139 9.22717 21.5 12 21.5C14.7729 21.5 16.9687 21.139 18.531 20.7494C20.4106 20.2807 21.9018 18.9228 22.3955 17.0496C22.7238 15.8044 23 14.1401 23 12.0655C23 10.2311 22.784 8.70072 22.5072 7.49236C21.9974 5.26792 20.1974 3.6894 17.9724 3.18198C16.3835 2.81963 14.3235 2.5 12 2.5C9.67659 2.5 7.61653 2.81963 6.02765 3.18198ZM3 12.0655C3 13.9604 3.25207 15.4535 3.53839 16.5399C3.82905 17.6427 4.71438 18.5 5.95296 18.8089C7.369 19.162 9.40215 19.5 12 19.5C14.5979 19.5 16.6311 19.162 18.0471 18.8089C19.2856 18.5 20.1709 17.6427 20.4616 16.5399C20.7479 15.4535 21 13.9605 21 12.0655C21 10.3894 20.8028 9.00881 20.5577 7.93906C20.244 6.57015 19.1176 5.49451 17.5277 5.13192C16.0518 4.79533 14.1435 4.5 12 4.5C9.85658 4.5 7.94824 4.79533 6.47234 5.13192C4.88239 5.49452 3.75598 6.57018 3.44231 7.9391C3.19719 9.00884 3 10.3894 3 12.0655Z"/></svg>;
}

const IconCozBot = React.forwardRef(IconCozBotComponent);
export default IconCozBot;
