import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozReplyComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_reply${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M11.9842 7.51024L11.9942 3.41663C11.9963 2.52539 10.9233 2.07335 10.2922 2.70268C8.1253 4.86354 4.4235 8.55708 2.36879 10.6188C1.60344 11.3868 1.60608 12.6133 2.37179 13.3809C4.41566 15.4299 8.12209 19.1302 10.2916 21.2952C10.9226 21.9249 11.9963 21.4731 11.9941 20.5816L11.9842 16.5149H13.0118C17.001 16.5149 20.0229 17.3161 21.8567 19.6721C22.229 20.1503 23.0001 19.8533 23.0001 19.2473C23.0001 19.0709 23.0001 18.9269 23.0001 18.8457C23.0001 12.6853 18.0683 7.51024 11.9842 7.51024ZM11.9839 9.51565C15.9294 9.51565 19.5859 12.4389 20.4976 15.8631C18.45 14.6383 14.9168 14.5034 12.0104 14.5034H10.001V18.0009L4.25933 12.7107C3.84129 12.3255 3.82797 11.6698 4.23003 11.2679L10.001 5.5003V9.5012L11.9839 9.51565Z"/></svg>;
}

const IconCozReply = React.forwardRef(IconCozReplyComponent);
export default IconCozReply;
