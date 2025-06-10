import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozContentComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_content${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M2 4C2 2.89543 2.89543 2 4 2H6V4L4 4V6H2V4ZM14 4H10V2H14V4ZM20 4H18V2H20C21.1046 2 22 2.89543 22 4V6H20V4ZM20 14V10H22V14H20ZM4 10V14H2V10H4ZM4 18V20H6V22H4C2.89543 22 2 21.1046 2 20V18H4ZM20 20V18H22V20C22 21.1046 21.1046 22 20 22H18V20H20ZM10 20H14V22H10V20Z"/></svg>;
}

const IconCozContent = React.forwardRef(IconCozContentComponent);
export default IconCozContent;
