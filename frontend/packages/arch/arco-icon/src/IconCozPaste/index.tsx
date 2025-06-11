import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozPasteComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_paste${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M10.5 4C11.3284 4 12 3.32843 12 2.5 12 1.67157 11.3284 1 10.5 1 9.67157 1 9 1.67157 9 2.5 9 3.32843 9.67157 4 10.5 4zM15.5 4C16.3284 4 17 3.32843 17 2.5 17 1.67157 16.3284 1 15.5 1 14.6716 1 14 1.67157 14 2.5 14 3.32843 14.6716 4 15.5 4zM22 2.5C22 3.32843 21.3284 4 20.5 4 19.6716 4 19 3.32843 19 2.5 19 1.67157 19.6716 1 20.5 1 21.3284 1 22 1.67157 22 2.5zM20.5 9C21.3284 9 22 8.32843 22 7.5 22 6.67157 21.3284 6 20.5 6 19.6716 6 19 6.67157 19 7.5 19 8.32843 19.6716 9 20.5 9zM22 12.5C22 13.3284 21.3284 14 20.5 14 19.6716 14 19 13.3284 19 12.5 19 11.6716 19.6716 11 20.5 11 21.3284 11 22 11.6716 22 12.5zM3 8C3 6.89543 3.89543 6 5 6H15C16.1046 6 17 6.89543 17 8V20C17 21.1046 16.1046 22 15 22H5C3.89543 22 3 21.1046 3 20V8zM15 8H5V20H15V8z"/></svg>;
}

const IconCozPaste = React.forwardRef(IconCozPasteComponent);
export default IconCozPaste;
