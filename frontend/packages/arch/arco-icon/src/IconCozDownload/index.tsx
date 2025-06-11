import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozDownloadComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_download${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M20 18C20.5523 18 21 18.4477 21 19V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V19C3 18.4477 3.44772 18 4 18C4.55228 18 5 18.4477 5 19V20H19V19C19 18.4477 19.4477 18 20 18ZM13 14.0357L15.657 11.3787C16.0475 10.9882 16.6806 10.9885 17.071 11.3789C17.4615 11.7694 17.4617 12.4025 17.0713 12.793C15.6569 14.2079 14.2431 15.6235 12.8275 17.0373C12.4374 17.4269 11.8054 17.4269 11.4152 17.0373C9.99783 15.6217 8.58224 14.2043 7.16602 12.7876C6.77967 12.401 6.79217 11.7722 7.1786 11.3858C7.56503 10.9993 8.19388 10.9868 8.58031 11.3733L11 13.793V3.5C11 2.94771 11.4477 2.5 12 2.5C12.5523 2.5 13 2.94772 13 3.5V14.0357Z"/></svg>;
}

const IconCozDownload = React.forwardRef(IconCozDownloadComponent);
export default IconCozDownload;
