import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozDouyinBotFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_douyin_bot_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M23 12C23 18.0751 18.0751 23 12 23H4.61803C3.87465 23 3.39116 22.2177 3.72361 21.5528L4.48405 20.0319C2.3399 18.0247 1 15.1688 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12ZM17.1695 9.26913L16.9763 9.3209C16.3167 9.49764 15.6288 9.54273 14.9517 9.4536C14.6485 9.41368 14.3501 9.34718 14.06 9.25525L15.2552 13.7161C15.8556 15.9567 14.526 18.2597 12.2854 18.86C10.0448 19.4604 7.74182 18.1307 7.14147 15.8902C6.54111 13.6496 7.87076 11.3466 10.1113 10.7463C10.3756 10.6754 10.6409 10.6315 10.9043 10.6127L11.5542 13.0382C11.2905 12.9848 11.0106 12.99 10.7325 13.0645C9.77224 13.3218 9.2024 14.3088 9.45969 15.269C9.71699 16.2293 10.704 16.7991 11.6642 16.5418C12.6245 16.2845 13.1943 15.2975 12.937 14.3373L10.5559 5.45076L12.8741 4.82959L12.9259 5.02278C13.021 5.37795 13.1852 5.7109 13.4091 6.00261C13.6329 6.29433 13.912 6.5391 14.2305 6.72295C14.5489 6.90681 14.9004 7.02613 15.265 7.07413C15.6295 7.12212 16 7.09784 16.3552 7.00268L16.5483 6.95091L17.1695 9.26913Z"/></svg>;
}

const IconCozDouyinBotFill = React.forwardRef(IconCozDouyinBotFillComponent);
export default IconCozDouyinBotFill;
