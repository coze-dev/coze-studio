import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozDocCommentComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_doc_comment${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M5 3H19V8H21V3C21 1.89543 20.1046 1 19 1H5C3.89543 1 3 1.89543 3 3V21C3 22.1046 3.89543 23 5 23H8V21H5V3Z"/><path d="M13 15.5C13 14.9477 13.4477 14.5 14 14.5H18C18.5523 14.5 19 14.9477 19 15.5C19 16.0523 18.5523 16.5 18 16.5H14C13.4477 16.5 13 16.0523 13 15.5Z"/><path d="M19 21H21C22.1046 21 23 20.1046 23 19V12C23 10.8954 22.1046 10 21 10H11C9.89543 10 9 10.8954 9 12V19C9 20.1046 9.89543 21 11 21H13L15.6799 23.2333C15.8653 23.3878 16.1347 23.3878 16.3201 23.2333L19 21ZM18.2759 19L16 20.8966L13.7241 19H11V12H21V19H18.2759Z"/></svg>;
}

const IconCozDocComment = React.forwardRef(IconCozDocCommentComponent);
export default IconCozDocComment;
