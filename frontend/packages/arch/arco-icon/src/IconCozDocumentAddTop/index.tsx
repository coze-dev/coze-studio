import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozDocumentAddTopComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_document_add_top${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M19 21L5 21L5 3L16.5 3L16.5 2C16.5 1.64445 16.5742 1.30623 16.708 0.999999L5 0.999999C3.89543 0.999999 3 1.89543 3 3L3 21C3 22.1046 3.89543 23 5 23L19 23C20.1046 23 21 22.1046 21 21L21 11.5002C20.5439 12.1073 19.8178 12.5 19 12.5L19 21Z"/><path d="M7 10.9805C7 11.5328 7.44772 11.9805 8 11.9805L13 11.9805C13.5523 11.9805 14 11.5328 14 10.9805 14 10.4282 13.5523 9.98047 13 9.98047L8 9.98047C7.44772 9.98047 7 10.4282 7 10.9805zM8 17C7.44772 17 7 16.5523 7 16 7 15.4477 7.44772 15 8 15H16C16.5523 15 17 15.4477 17 16 17 16.5523 16.5523 17 16 17H8zM19 11C19.5523 11 20 10.5523 20 10L20 7 23 7C23.5523 7 24 6.55228 24 6 24 5.44771 23.5523 5 23 5L20 5 20 2C20 1.44771 19.5523.999999 19 .999999 18.4477.999999 18 1.44771 18 2L18 5 15 5C14.4477 5 14 5.44771 14 6 14 6.55228 14.4477 7 15 7L18 7 18 10C18 10.5523 18.4477 11 19 11z"/></svg>;
}

const IconCozDocumentAddTop = React.forwardRef(IconCozDocumentAddTopComponent);
export default IconCozDocumentAddTop;
