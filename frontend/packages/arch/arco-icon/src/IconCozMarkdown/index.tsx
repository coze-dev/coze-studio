import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozMarkdownComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_markdown${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M4.59306 8.57818C4.53334 8.70635 4.5 8.84928 4.5 9V15C4.5 15.5523 4.94772 16 5.5 16 6.05228 16 6.5 15.5523 6.5 15V11.4142L7.79106 12.7052C7.98679 12.901 8.24347 12.9986 8.5 12.9981 8.75653 12.9986 9.01321 12.901 9.20894 12.7052L10.5 11.4142V15C10.5 15.5523 10.9477 16 11.5 16 12.0523 16 12.5 15.5523 12.5 15V9C12.5 8.84928 12.4667 8.70635 12.4069 8.57818 12.3689 8.49635 12.3192 8.41861 12.2578 8.34747 12.2267 8.31139 12.1931 8.27756 12.1572 8.24625 12.0784 8.17741 11.9914 8.123 11.8996 8.08303 11.7772 8.02962 11.6421 8 11.5 8 11.3704 8 11.2465 8.02466 11.1329 8.06953 11.0091 8.11832 10.893 8.19277 10.7929 8.29289L8.5 10.5858 6.20714 8.29289C6.10707 8.19282 5.99106 8.11839 5.86728 8.0696 5.75358 8.02468 5.62967 8 5.5 8 5.35794 8 5.2228 8.02962 5.10041 8.08303 5.00811 8.12323 4.92063 8.17802 4.84149 8.24741 4.73731 8.33864 4.65224 8.45116 4.59306 8.57818zM16.5012 8C15.9489 8 15.5012 8.44772 15.5012 9V12.8345L15.0871 12.4204C14.6966 12.0298 14.0634 12.0298 13.6729 12.4204 13.2824 12.8109 13.2824 13.444 13.6729 13.8346L15.7766 15.9383C15.7823 15.9443 15.7881 15.9502 15.794 15.9561 16.1846 16.3467 16.8177 16.3467 17.2082 15.9561L19.3296 13.8348C19.7201 13.4443 19.7201 12.8111 19.3296 12.4206 18.939 12.0301 18.3059 12.0301 17.9154 12.4206L17.5012 12.8347V9C17.5012 8.44772 17.0535 8 16.5012 8z"/><path fillRule="evenodd" clipRule="evenodd" d="M3 3C1.89543 3 1 3.89543 1 5V19C1 20.1046 1.89543 21 3 21H21C22.1046 21 23 20.1046 23 19V5C23 3.89543 22.1046 3 21 3H3ZM21 5H3V19H21V5Z"/></svg>;
}

const IconCozMarkdown = React.forwardRef(IconCozMarkdownComponent);
export default IconCozMarkdown;
