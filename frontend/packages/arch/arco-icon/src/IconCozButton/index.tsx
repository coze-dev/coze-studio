import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozButtonComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_button${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M5.25 8C4.83579 8 4.5 8.33579 4.5 8.75V15.25C4.5 15.6642 4.83579 16 5.25 16H7.625C8.93668 16 10 14.9367 10 13.625C10 12.9236 9.69599 12.2933 9.21255 11.8585C9.53809 11.4521 9.73279 10.9363 9.73279 10.375C9.73279 9.06332 8.66946 8 7.35779 8H5.25ZM6.5 9.825V11.25H7.28555C7.67905 11.25 7.99805 10.931 7.99805 10.5375C7.99805 10.144 7.67905 9.825 7.28555 9.825H6.5ZM6.5 12.75V14.175H7.5575C7.951 14.175 8.27 13.856 8.27 13.4625C8.27 13.069 7.951 12.75 7.5575 12.75H6.5Z"/><path d="M11.75 8C11.3358 8 11 8.33579 11 8.75V9.5H10.75C10.3358 9.5 10 9.83579 10 10.25V10.5C10 10.9142 10.3358 11.25 10.75 11.25H11V14.5C11 15.3284 11.6716 16 12.5 16H13.25C13.6642 16 14 15.6642 14 15.25V14.75C14 14.3358 13.6642 14 13.25 14H13V11.25H13.25C13.6642 11.25 14 10.9142 14 10.5V10.25C14 9.83579 13.6642 9.5 13.25 9.5H13V8.75C13 8.33579 12.6642 8 12.25 8H11.75zM14.5 9.75C14.5 9.33579 14.8358 9 15.25 9H15.75C16.1216 9 16.4301 9.27028 16.4896 9.62499 16.8005 9.24358 17.2741 9 17.8045 9 18.7409 9 19.5 9.7591 19.5 10.6955V15.25C19.5 15.6642 19.1642 16 18.75 16H18.25C17.8358 16 17.5 15.6642 17.5 15.25V11.5C17.5 11.2239 17.2761 11 17 11 16.7239 11 16.5 11.2239 16.5 11.5V15.25C16.5 15.6642 16.1642 16 15.75 16H15.25C14.8358 16 14.5 15.6642 14.5 15.25V9.75z"/><path fillRule="evenodd" clipRule="evenodd" d="M1 5C1 3.89543 1.89543 3 3 3H21C22.1046 3 23 3.89543 23 5V19C23 20.1046 22.1046 21 21 21H3C1.89543 21 1 20.1046 1 19V5ZM3 5H21V19H3V5Z"/></svg>;
}

const IconCozButton = React.forwardRef(IconCozButtonComponent);
export default IconCozButton;
