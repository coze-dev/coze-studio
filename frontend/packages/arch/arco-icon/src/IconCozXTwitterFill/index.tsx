import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozXTwitterFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_x_twitter_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M11.1568 12.095C8.9418 9.13267 7.09424 6.65401 7.06505 6.60267C7.01343 6.51497 7.16772 6.50001 7.92276 6.50001H8.8318L12.8951 11.9267C15.1242 14.9116 16.9651 17.39 16.9718 17.4267C16.9868 17.4707 16.6493 17.5 16.0918 17.5L15.1901 17.4925L11.1568 12.095Z"/><path fillRule="evenodd" clipRule="evenodd" d="M1.93847 7.62934C3.50839 4.02853 6.9618 1.48401 10.8268 1.08067C12.1251 0.948527 13.2685 1.02934 14.5668 1.33734C20.4774 2.7449 24.1293 8.77334 22.6409 14.6692C21.6876 18.4315 18.7834 21.4599 15.0951 22.5232C12.6308 23.2416 9.95409 23.0732 7.62943 22.0615C4.65943 20.7632 2.36409 18.1673 1.47676 15.0948C0.758387 12.6307 0.92676 9.95401 1.93847 7.62934ZM12.7334 10.1667C12.7041 10.1667 11.9118 9.14001 10.9734 7.89334L9.2718 5.62001H7.26276C6.15513 5.62001 5.25343 5.62749 5.25343 5.64171C5.25343 5.65667 6.42676 7.23334 7.85676 9.14001C9.28676 11.054 10.4528 12.645 10.4451 12.675C10.4309 12.6967 9.25757 13.98 7.8418 15.5127C6.41943 17.045 5.25343 18.3216 5.25343 18.3433C5.25343 18.365 5.51009 18.38 5.82513 18.38H6.39009L8.62676 15.9527C9.85847 14.6183 10.9001 13.496 10.9441 13.4593C11.0028 13.4149 11.6041 14.156 12.8874 15.8793L14.7501 18.3727L16.7518 18.38C17.8451 18.38 18.7468 18.3583 18.7468 18.3216C18.7468 18.2917 17.5074 16.62 15.9968 14.6033L13.2468 10.944L13.5985 10.57C13.7968 10.3717 14.7941 9.29401 15.8134 8.18667C16.8328 7.07919 17.7861 6.04505 17.9328 5.89163L18.1894 5.62001H16.9941L14.8894 7.89334C13.7384 9.14001 12.7628 10.1667 12.7334 10.1667Z"/></svg>;
}

const IconCozXTwitterFill = React.forwardRef(IconCozXTwitterFillComponent);
export default IconCozXTwitterFill;
