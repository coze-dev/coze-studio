import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozAlignTopComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_align_top${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M1.73325 2.66666C1.51234 2.66666 1.33325 2.84574 1.33325 3.06666V4.26666C1.33325 4.48757 1.51234 4.66666 1.73325 4.66666H22.2666C22.4875 4.66666 22.6666 4.48757 22.6666 4.26666V3.06666C22.6666 2.84574 22.4875 2.66666 22.2666 2.66666H1.73325zM6.89992 19.8538C6.89992 20.1483 7.29667 20.3871 7.78609 20.3871H9.61375C10.1032 20.3871 10.4999 20.1483 10.4999 19.8538L10.4999 7.59826C10.4999 7.30371 10.1032 7.06493 9.61375 7.06493H7.78609C7.29667 7.06493 6.89992 7.30371 6.89992 7.59826L6.89992 19.8538zM13.4999 15.8623C13.4999 16.1569 13.8967 16.3956 14.3861 16.3956H16.2137C16.7032 16.3956 17.0999 16.1569 17.0999 15.8623L17.0999 7.59826C17.0999 7.30371 16.7032 7.06493 16.2137 7.06493H14.3861C13.8967 7.06493 13.4999 7.30371 13.4999 7.59826L13.4999 15.8623z"/></svg>;
}

const IconCozAlignTop = React.forwardRef(IconCozAlignTopComponent);
export default IconCozAlignTop;
