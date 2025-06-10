import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozThumbsupComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_thumbsup${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M14.998 7.99861H19.2901C22.276 7.99861 22.9618 10.6327 22.276 12.6065L19.2901 20.4624C19.0378 21.3761 18.1975 22.01 17.2386 22.01H5.98205C5.43155 22.01 4.98528 21.564 4.98528 21.0138 4.98528 20.5787 4.98528 20.1381 4.98528 20.0098V10.0441C4.98528 9.91339 4.98528 9.44842 4.98528 8.99477 4.98528 8.44459 5.43155 7.99861 5.98205 7.99861H6.5139C6.83973 7.99861 7.14516 7.84006 7.33254 7.57365L11.4867 1.6675C11.7679 1.2204 12.5269.877653 13.3359 1.24584 14.5493 1.79812 16.0019 3.00372 16.0019 5.00122 16.0019 5.75457 15.6673 6.7537 14.998 7.99861zM19.2901 9.99881H11.6506L13.235 7.05187C13.7619 6.0719 14.0006 5.35921 14.0006 5.00122 14.0006 4.42087 13.8788 3.76445 12.8367 3.22628L8.37204 9.57386C8.18466 9.84026 7.87922 9.99881 7.55339 9.99881H6.98664V20.0098H17.2386C17.3006 20.0098 17.3489 19.9734 17.3608 19.9303L17.3858 19.8398 20.3937 11.9261C20.7892 10.7618 20.3947 9.99881 19.2901 9.99881zM3.48376 21.0138V8.99634C3.48376 8.49825 3.09559 8.01599 2.487 8.00015 1.91282 7.98521 1.49023 8.49825 1.49023 8.99634V21.0138C1.49023 21.5119 1.88738 22.01 2.487 22.01 3.08662 22.01 3.48376 21.5119 3.48376 21.0138z"/></svg>;
}

const IconCozThumbsup = React.forwardRef(IconCozThumbsupComponent);
export default IconCozThumbsup;
