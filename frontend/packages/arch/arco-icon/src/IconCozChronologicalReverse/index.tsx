import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozChronologicalReverseComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_chronological_reverse${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M8.50001 5.38446L8.50002 3.06709C9.85258 2.3844 11.3813 1.99986 12.9999 1.99986C18.5227 1.99986 22.9999 6.47701 22.9999 11.9999C22.9999 17.5227 18.5227 21.9999 12.9999 21.9999C11.3813 21.9999 9.85258 21.6153 8.50002 20.9326V18.6153C9.7821 19.489 11.3313 19.9999 12.9999 19.9999C17.4182 19.9999 20.9999 16.4181 20.9999 11.9999C20.9999 7.58158 17.4182 3.99986 12.9999 3.99986C11.3313 3.99986 9.7821 4.51068 8.50001 5.38446Z"/><path d="M18 11.9999C18 12.5521 17.5523 12.9999 17 12.9999H13C12.4477 12.9999 12 12.5521 12 11.9999V7.99986C12 7.44758 12.4477 6.99986 13 6.99986 13.5523 6.99986 14 7.44758 14 7.99986V10.9999H17C17.5523 10.9999 18 11.4476 18 11.9999zM1.9911 9.92794C1.51281 9.6518 1.34894 9.04021 1.62508 8.56192L5.12508 2.49974C5.31468 2.17134 5.66242 1.99117 6.01658 1.99987 6.56122 2.00872 7.00002 2.45299 7.00002 2.99974V20.9997C7.00002 21.552 6.5523 21.9997 6.00002 21.9997 5.44773 21.9997 5.00002 21.552 5.00002 20.9997L5.00001 6.71636 3.35713 9.56192C3.08099 10.0402 2.4694 10.2041 1.9911 9.92794z"/></svg>;
}

const IconCozChronologicalReverse = React.forwardRef(IconCozChronologicalReverseComponent);
export default IconCozChronologicalReverse;
