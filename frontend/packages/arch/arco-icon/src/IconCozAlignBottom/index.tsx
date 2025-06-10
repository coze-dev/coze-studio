import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozAlignBottomComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_align_bottom${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M1.73325 19.3333C1.51234 19.3333 1.33325 19.5124 1.33325 19.7333V20.9333C1.33325 21.1542 1.51234 21.3333 1.73325 21.3333H22.2666C22.4875 21.3333 22.6666 21.1542 22.6666 20.9333V19.7333C22.6666 19.5124 22.4875 19.3333 22.2666 19.3333H1.73325zM6.89992 16.4039C6.89992 16.6985 7.29667 16.9372 7.78609 16.9372H9.61375C10.1032 16.9372 10.4999 16.6985 10.4999 16.4039L10.4999 4.14839C10.4999 3.85383 10.1032 3.61505 9.61375 3.61505L7.78609 3.61505C7.29667 3.61505 6.89992 3.85383 6.89992 4.14838L6.89992 16.4039zM13.4999 16.4039C13.4999 16.6985 13.8967 16.9373 14.3861 16.9373H16.2137C16.7032 16.9373 17.0999 16.6985 17.0999 16.4039L17.0999 8.1399C17.0999 7.84535 16.7032 7.60657 16.2137 7.60657H14.3861C13.8967 7.60657 13.4999 7.84535 13.4999 8.1399L13.4999 16.4039z"/></svg>;
}

const IconCozAlignBottom = React.forwardRef(IconCozAlignBottomComponent);
export default IconCozAlignBottom;
