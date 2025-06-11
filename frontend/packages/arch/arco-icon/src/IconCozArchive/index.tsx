import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozArchiveComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_archive${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M12 9.5C12.5523 9.5 13 9.94772 13 10.5V14.0858L14.1213 12.9645C14.5118 12.5739 15.145 12.5739 15.5355 12.9645C15.9261 13.355 15.9261 13.9882 15.5355 14.3787L12.7071 17.2071C12.3166 17.5976 11.6834 17.5976 11.2929 17.2071L8.46447 14.3787C8.07394 13.9882 8.07394 13.355 8.46447 12.9645C8.85499 12.5739 9.48816 12.5739 9.87868 12.9645L11 14.0858V10.5C11 9.94772 11.4477 9.5 12 9.5Z"/><path fillRule="evenodd" clipRule="evenodd" d="M23 6.97817C23 6.36099 22.7151 5.77838 22.2279 5.39946L19.0417 2.9213C18.6906 2.64824 18.2585 2.5 17.8138 2.5H6.18622C5.74146 2.5 5.3094 2.64824 4.95833 2.9213L1.77212 5.39946C1.28495 5.77838 1 6.36099 1 6.97817V19C1 20.1046 1.89543 21 3 21H21C22.1046 21 23 20.1046 23 19V6.97817ZM17.8138 4.5H6.18622L4.25764 6H19.7424L17.8138 4.5ZM21 8H3V19H21V8Z"/></svg>;
}

const IconCozArchive = React.forwardRef(IconCozArchiveComponent);
export default IconCozArchive;
