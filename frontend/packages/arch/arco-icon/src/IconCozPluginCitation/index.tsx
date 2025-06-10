import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozPluginCitationComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_plugin_citation${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M3.5 14L3.5 8C3.5 6.89543 4.39543 6 5.5 6L18.5 6C19.6046 6 20.5 6.89543 20.5 8V12.8779C20.774 12.9836 21.0361 13.1501 21.2701 13.3841L22.4807 14.5947C22.4935 14.3981 22.5 14.1998 22.5 14V8C22.5 5.79086 20.7091 4 18.5 4H17.75V1.25C17.75 0.559644 17.1904 0 16.5 0C15.8096 0 15.25 0.559644 15.25 1.25V4L8.75 4L8.75 1.25C8.75 0.559644 8.19036 0 7.5 0C6.80964 0 6.25 0.559645 6.25 1.25L6.25 4H5.5C3.29086 4 1.5 5.79086 1.5 8V14C1.5 18.9706 5.52944 23 10.5 23H13.1433L12.1488 22.0054C11.8484 21.7051 11.6593 21.3586 11.5672 21H10.5C6.63401 21 3.5 17.866 3.5 14Z"/><path d="M9 16H11.8488C11.6362 16.3677 11.5145 16.7945 11.5145 17.2498 11.5145 17.5112 11.5546 17.7632 11.629 18H9C8.44772 18 8 17.5523 8 17 8 16.4477 8.44772 16 9 16zM14.0115 18.2497H22.3215C22.9451 18.2497 23.2575 17.4957 22.8165 17.0548L20.2064 14.4447C19.7655 14.0037 19.0115 14.3161 19.0115 14.9397V16.2497H14.0115C13.4592 16.2497 13.0115 16.6975 13.0115 17.2497 13.0115 17.802 13.4592 18.2497 14.0115 18.2497zM22.0115 21.7497C22.5637 21.7497 23.0115 21.302 23.0115 20.7497 23.0115 20.1975 22.5637 19.7497 22.0115 19.7497H13.7014C13.0778 19.7497 12.7655 20.5037 13.2064 20.9447L15.8165 23.5548C16.2575 23.9957 17.0115 23.6834 17.0115 23.0598V21.7497H22.0115z"/></svg>;
}

const IconCozPluginCitation = React.forwardRef(IconCozPluginCitationComponent);
export default IconCozPluginCitation;
