import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozChatStarFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_chat_star_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M23 12C23 18.0751 18.0751 23 12 23H4.61803C3.87465 23 3.39116 22.2177 3.72361 21.5528L4.48405 20.0319C2.3399 18.0247 1 15.1688 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12ZM16.1625 6.69348C16.067 6.43551 15.7022 6.43551 15.6067 6.69348L15.345 7.40073C15.315 7.48183 15.2511 7.54578 15.17 7.57579L14.4627 7.8375C14.2047 7.93295 14.2047 8.29782 14.4627 8.39327L15.17 8.65498C15.2511 8.68499 15.315 8.74894 15.345 8.83004L15.6067 9.53729C15.7022 9.79526 16.067 9.79526 16.1625 9.53729L16.4242 8.83004C16.4542 8.74894 16.5182 8.68499 16.5993 8.65498L17.3065 8.39327C17.5645 8.29782 17.5645 7.93295 17.3065 7.8375L16.5993 7.57579C16.5182 7.54578 16.4542 7.48183 16.4242 7.40073L16.1625 6.69348ZM11.0125 7.88812C11.2989 7.11422 12.3935 7.11422 12.6798 7.88812L13.4649 10.0099C13.555 10.2532 13.7468 10.445 13.9901 10.5351L16.1119 11.3202C16.8858 11.6065 16.8858 12.7011 16.1119 12.9875L13.9901 13.7726C13.7468 13.8627 13.555 14.0545 13.4649 14.2978L12.6798 16.4196C12.3935 17.1935 11.2989 17.1935 11.0125 16.4196L10.2274 14.2978C10.1373 14.0545 9.9455 13.8627 9.70218 13.7726L7.58043 12.9875C6.80653 12.7011 6.80652 11.6065 7.58043 11.3202L9.70218 10.5351C9.9455 10.445 10.1373 10.2532 10.2274 10.0099L11.0125 7.88812Z"/></svg>;
}

const IconCozChatStarFill = React.forwardRef(IconCozChatStarFillComponent);
export default IconCozChatStarFill;
