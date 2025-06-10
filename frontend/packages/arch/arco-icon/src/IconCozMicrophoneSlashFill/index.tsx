import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozMicrophoneSlashFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_microphone_slash_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M6.99985 11V10.5369L12.4436 15.9806C12.2974 15.9934 12.1494 16 11.9998 16C9.23843 16 6.99985 13.7614 6.99985 11Z"/><path d="M11.9998 18C12.7434 18 13.4599 17.8841 14.1323 17.6693L15.679 19.2161C14.8455 19.5899 13.9447 19.8406 12.9998 19.9451V22.5C12.9998 23.0523 12.5521 23.5 11.9998 23.5 11.4476 23.5 10.9998 23.0523 10.9998 22.5V19.9451C6.4999 19.4476 2.99985 15.6326 2.99985 11V10C2.99985 9.44771 3.44756 9 3.99985 9 4.55213 9 4.99985 9.44772 4.99985 10V11C4.99985 14.866 8.13386 18 11.9998 18zM18.0515 14.5205L19.503 15.972C20.4488 14.5475 20.9998 12.8381 20.9998 11V10C20.9998 9.44772 20.5521 9 19.9998 9 19.4476 9 18.9998 9.44771 18.9998 10V11C18.9998 12.2835 18.6544 13.4863 18.0515 14.5205zM7.45145 3.92052L16.5676 13.0367C16.8454 12.4146 16.9998 11.7253 16.9998 11V6C16.9998 3.23858 14.7613 1 11.9998 1 9.98043 1 8.24063 2.19718 7.45145 3.92052zM1.70696 1.70281C1.31643 2.09333 1.31643 2.7265 1.70696 3.11702L20.7988 22.2089C21.1894 22.5994 21.8225 22.5994 22.2131 22.2089 22.6036 21.8184 22.6036 21.1852 22.2131 20.7947L3.12117 1.70281C2.73064 1.31228 2.09748 1.31228 1.70696 1.70281z"/></svg>;
}

const IconCozMicrophoneSlashFill = React.forwardRef(IconCozMicrophoneSlashFillComponent);
export default IconCozMicrophoneSlashFill;
