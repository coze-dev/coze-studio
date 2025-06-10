import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozDocumentComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_document${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M7 8.5C7 7.94772 7.44772 7.5 8 7.5H12C12.5523 7.5 13 7.94772 13 8.5 13 9.05229 12.5523 9.5 12 9.5H8C7.44772 9.5 7 9.05229 7 8.5zM7 12.5C7 11.9477 7.44772 11.5 8 11.5H16C16.5523 11.5 17 11.9477 17 12.5 17 13.0523 16.5523 13.5 16 13.5H8C7.44772 13.5 7 13.0523 7 12.5zM7 16.5C7 15.9477 7.44772 15.5 8 15.5H16C16.5523 15.5 17 15.9477 17 16.5 17 17.0523 16.5523 17.5 16 17.5H8C7.44772 17.5 7 17.0523 7 16.5z"/><path d="M3 3C3 1.89543 3.89543 1 5 1H19C20.1046 1 21 1.89543 21 3V21C21 22.1046 20.1046 23 19 23H5C3.89543 23 3 22.1046 3 21V3ZM5 3V21H19V3H5Z"/></svg>;
}

const IconCozDocument = React.forwardRef(IconCozDocumentComponent);
export default IconCozDocument;
