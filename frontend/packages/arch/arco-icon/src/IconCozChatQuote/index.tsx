import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozChatQuoteComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_chat_quote${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M6 10C6 8.067 7.567 6.5 9.5 6.5H10C10.5523 6.5 11 6.94772 11 7.5 11 8.05228 10.5523 8.5 10 8.5H9.5C8.67157 8.5 8 9.17157 8 10V10.5H10C10.5523 10.5 11 10.9477 11 11.5V13.5C11 14.0523 10.5523 14.5 10 14.5H7C6.44772 14.5 6 14.0523 6 13.5V10zM16.5 6.5C14.567 6.5 13 8.067 13 10V13.5C13 14.0523 13.4477 14.5 14 14.5H17C17.5523 14.5 18 14.0523 18 13.5V11.5C18 10.9477 17.5523 10.5 17 10.5H15V10C15 9.17157 15.6716 8.5 16.5 8.5H17C17.5523 8.5 18 8.05228 18 7.5 18 6.94772 17.5523 6.5 17 6.5H16.5z"/><path fillRule="evenodd" clipRule="evenodd" d="M23 4C23 2.9 22.1 2 21 2H3C1.9 2 1 2.9 1 4V17.0111C1 18.0211 1.9 19.0111 3 19.0111H7.7586L10.4774 22C10.9822 22.5017 11.3166 22.6311 12 22.7009C12.414 22.707 13.0502 22.5093 13.5 22L16.2414 19.0111H21C22.1 19.0111 23 18.1111 23 17.0111V4ZM3 4H21V17.0111H15.5L12 20.6714L8.5 17.0111H3V4Z"/></svg>;
}

const IconCozChatQuote = React.forwardRef(IconCozChatQuoteComponent);
export default IconCozChatQuote;
