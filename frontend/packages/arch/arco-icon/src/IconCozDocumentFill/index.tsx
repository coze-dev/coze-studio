import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozDocumentFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_document_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 25 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M5.62329 1C4.51872 1 3.62329 1.89543 3.62329 3V21C3.62329 22.1046 4.51872 23 5.62329 23H19.6233C20.7279 23 21.6233 22.1046 21.6233 21V3C21.6233 1.89543 20.7279 1 19.6233 1H5.62329ZM7.62329 8.5C7.62329 7.94772 8.07101 7.5 8.62329 7.5H12.6233C13.1756 7.5 13.6233 7.94772 13.6233 8.5C13.6233 9.05229 13.1756 9.5 12.6233 9.5H8.62329C8.07101 9.5 7.62329 9.05229 7.62329 8.5ZM7.62329 12.5C7.62329 11.9477 8.07101 11.5 8.62329 11.5H16.6233C17.1756 11.5 17.6233 11.9477 17.6233 12.5C17.6233 13.0523 17.1756 13.5 16.6233 13.5H8.62329C8.07101 13.5 7.62329 13.0523 7.62329 12.5ZM8.62329 15.5C8.07101 15.5 7.62329 15.9477 7.62329 16.5C7.62329 17.0523 8.07101 17.5 8.62329 17.5H16.6233C17.1756 17.5 17.6233 17.0523 17.6233 16.5C17.6233 15.9477 17.1756 15.5 16.6233 15.5H8.62329Z"/></svg>;
}

const IconCozDocumentFill = React.forwardRef(IconCozDocumentFillComponent);
export default IconCozDocumentFill;
