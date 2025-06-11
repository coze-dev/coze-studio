import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozTextAreaComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_text_area${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M5.5 6.49512C4.94772 6.49512 4.5 6.94283 4.5 7.49512C4.5 8.0474 4.94772 8.49512 5.5 8.49512H7V13H5.5C4.94772 13 4.5 13.4477 4.5 14C4.5 14.5523 4.94772 15 5.5 15H10.5C11.0523 15 11.5 14.5523 11.5 14C11.5 13.4477 11.0523 13 10.5 13H9V8.49512H10.5C11.0523 8.49512 11.5 8.0474 11.5 7.49512C11.5 6.94283 11.0523 6.49512 10.5 6.49512H5.5Z"/><path fillRule="evenodd" clipRule="evenodd" d="M1 5C1 3.89543 1.89543 3 3 3H21C22.1046 3 23 3.89543 23 5V19C23 20.1046 22.1046 21 21 21H3C1.89543 21 1 20.1046 1 19V5ZM3 5H21V19H3V5Z"/></svg>;
}

const IconCozTextArea = React.forwardRef(IconCozTextAreaComponent);
export default IconCozTextArea;
