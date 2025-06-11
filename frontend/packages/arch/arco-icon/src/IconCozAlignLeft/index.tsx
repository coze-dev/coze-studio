import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozAlignLeftComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_align_left${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M6.04858 1.86671C6.04858 1.57215 5.8098 1.33337 5.51525 1.33337H4.58192C4.28737 1.33337 4.04858 1.57216 4.04858 1.86671V22.1334C4.04858 22.4279 4.28737 22.6667 4.58192 22.6667H5.51525C5.8098 22.6667 6.04858 22.4279 6.04858 22.1334V1.86671zM21.2387 17.0998C21.5332 17.0998 21.772 16.7031 21.772 16.2137V14.386C21.772 13.8966 21.5332 13.4998 21.2387 13.4998H8.98315C8.6886 13.4998 8.44982 13.8966 8.44982 14.386V16.2137C8.44982 16.7031 8.6886 17.0998 8.98315 17.0998H21.2387zM17.2472 10.5C17.5417 10.5 17.7805 10.1032 17.7805 9.61381V7.78615C17.7805 7.29673 17.5417 6.89998 17.2472 6.89998H8.98315C8.6886 6.89998 8.44982 7.29673 8.44982 7.78615V9.61381C8.44982 10.1032 8.6886 10.5 8.98315 10.5H17.2472z"/></svg>;
}

const IconCozAlignLeft = React.forwardRef(IconCozAlignLeftComponent);
export default IconCozAlignLeft;
