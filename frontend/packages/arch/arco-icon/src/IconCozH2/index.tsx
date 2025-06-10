import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozH2Component(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_h2${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M2 3C1.44772 3 1 3.44772 1 4V20C1 20.5523 1.44772 21 2 21 2.55228 21 3 20.5523 3 20V13H12V20C12 20.5523 12.4477 21 13 21 13.5523 21 14 20.5523 14 20V4C14 3.44772 13.5523 3 13 3 12.4477 3 12 3.44772 12 4V11H3V4C3 3.44772 2.55228 3 2 3zM22.9933 19.8723C22.9933 19.3107 22.538 18.8565 21.9764 18.8565H18.855L22.2618 14.5853C22.7491 13.9652 22.9933 13.2546 22.9933 12.4595 22.9823 11.4675 22.6464 10.643 21.9877 9.99538 21.3414 9.34354 20.4961 9.01096 19.4655 9 18.5335 9.01105 17.7458 9.33946 17.1093 9.98155 16.7394 10.3676 16.168 11.026 16.168 11.584 16.168 12.1753 16.6473 12.6546 17.2385 12.6546 17.8009 12.6546 18.0067 12.3067 18.2309 11.9279 18.2907 11.8269 18.3518 11.7236 18.4214 11.6241 18.4762 11.5456 18.5382 11.4743 18.6072 11.41 18.8685 11.1579 19.191 11.0338 19.5885 11.0338 20.036 11.0431 20.3729 11.1846 20.6099 11.4574 20.8428 11.7361 20.9595 12.0631 20.9595 12.4439 20.9595 12.5899 20.9404 12.747 20.902 12.9152 20.8519 13.0671 20.7456 13.2561 20.5866 13.4633L16.1853 18.9689C16.1286 19.0398 16.0977 19.1279 16.0977 19.2188V20.2409C16.0977 20.462 16.3647 20.8904 16.704 20.8904H21.9764C22.538 20.8904 22.9933 20.434 22.9933 19.8723z"/></svg>;
}

const IconCozH2 = React.forwardRef(IconCozH2Component);
export default IconCozH2;
