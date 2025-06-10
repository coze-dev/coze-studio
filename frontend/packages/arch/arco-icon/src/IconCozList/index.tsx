import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozListComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_list${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M9.5 7C9.5 7.69036 8.94036 8.25 8.25 8.25 7.55964 8.25 7 7.69036 7 7 7 6.30964 7.55964 5.75 8.25 5.75 8.94036 5.75 9.5 6.30964 9.5 7zM10.5 7C10.5 6.44772 10.9477 6 11.5 6H16C16.5523 6 17 6.44772 17 7 17 7.55228 16.5523 8 16 8H11.5C10.9477 8 10.5 7.55228 10.5 7zM9.5 12C9.5 12.6904 8.94036 13.25 8.25 13.25 7.55964 13.25 7 12.6904 7 12 7 11.3096 7.55964 10.75 8.25 10.75 8.94036 10.75 9.5 11.3096 9.5 12zM10.5 12C10.5 11.4477 10.9477 11 11.5 11H16C16.5523 11 17 11.4477 17 12 17 12.5523 16.5523 13 16 13H11.5C10.9477 13 10.5 12.5523 10.5 12zM9.5 17C9.5 17.6904 8.94036 18.25 8.25 18.25 7.55964 18.25 7 17.6904 7 17 7 16.3096 7.55964 15.75 8.25 15.75 8.94036 15.75 9.5 16.3096 9.5 17zM10.5 17C10.5 16.4477 10.9477 16 11.5 16H16C16.5523 16 17 16.4477 17 17 17 17.5523 16.5523 18 16 18H11.5C10.9477 18 10.5 17.5523 10.5 17z"/><path d="M5 1C3.89543 1 3 1.89543 3 3V21C3 22.1046 3.89543 23 5 23H19C20.1046 23 21 22.1046 21 21V3C21 1.89543 20.1046 1 19 1H5ZM5 21V3H19V21H5Z"/></svg>;
}

const IconCozList = React.forwardRef(IconCozListComponent);
export default IconCozList;
