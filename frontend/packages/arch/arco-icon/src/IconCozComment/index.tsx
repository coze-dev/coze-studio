import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozCommentComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_comment${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M6.5 9C5.94772 9 5.5 9.44772 5.5 10V11C5.5 11.5523 5.94772 12 6.5 12H7.5C8.05228 12 8.5 11.5523 8.5 11V10C8.5 9.44772 8.05228 9 7.5 9H6.5zM11.5 9C10.9477 9 10.5 9.44772 10.5 10V11C10.5 11.5523 10.9477 12 11.5 12H12.5C13.0523 12 13.5 11.5523 13.5 11V10C13.5 9.44772 13.0523 9 12.5 9H11.5zM15.5 10C15.5 9.44772 15.9477 9 16.5 9H17.5C18.0523 9 18.5 9.44772 18.5 10V11C18.5 11.5523 18.0523 12 17.5 12H16.5C15.9477 12 15.5 11.5523 15.5 11V10z"/><path d="M23 4C23 2.9 22.1 2 21 2H3C1.9 2 1 2.9 1 4V17.0111C1 18.0211 1.9 19.0111 3 19.0111H7.7586L10.4774 22C10.9822 22.5017 11.3166 22.6311 12 22.7009C12.414 22.707 13.0502 22.5093 13.5 22L16.2414 19.0111H21C22.1 19.0111 23 18.1111 23 17.0111V4ZM3 4H21V17.0111H15.5L12 20.6714L8.5 17.0111H3V4Z"/></svg>;
}

const IconCozComment = React.forwardRef(IconCozCommentComponent);
export default IconCozComment;
