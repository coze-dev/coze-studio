import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozDocumentAddBottomComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_document_add_bottom${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M19 3H5L5 21H16.5V22C16.5 22.3556 16.5742 22.6938 16.708 23H5C3.89543 23 3 22.1046 3 21V3C3 1.89543 3.89543 1 5 1H19C20.1046 1 21 1.89543 21 3V12.4998C20.5439 11.8927 19.8178 11.5 19 11.5V3Z"/><path d="M7 13.0195C7 12.4672 7.44772 12.0195 8 12.0195H13C13.5523 12.0195 14 12.4672 14 13.0195 14 13.5718 13.5523 14.0195 13 14.0195H8C7.44772 14.0195 7 13.5718 7 13.0195zM8 7C7.44772 7 7 7.44772 7 8 7 8.55228 7.44772 9 8 9H16C16.5523 9 17 8.55228 17 8 17 7.44772 16.5523 7 16 7H8zM19 13C19.5523 13 20 13.4477 20 14V17H23C23.5523 17 24 17.4477 24 18 24 18.5523 23.5523 19 23 19H20V22C20 22.5523 19.5523 23 19 23 18.4477 23 18 22.5523 18 22V19H15C14.4477 19 14 18.5523 14 18 14 17.4477 14.4477 17 15 17H18V14C18 13.4477 18.4477 13 19 13z"/></svg>;
}

const IconCozDocumentAddBottom = React.forwardRef(IconCozDocumentAddBottomComponent);
export default IconCozDocumentAddBottom;
