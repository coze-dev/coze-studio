import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozSceneFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_scene_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 25 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><g clipPath="url(#svg_5b44814902__clip0_8699_130827)"><path fillRule="evenodd" clipRule="evenodd" d="M16.7755 6.16059C16.8396 5.86723 16.8733 5.56256 16.8733 5.25C16.8733 2.90279 14.9705 1 12.6233 1C10.2761 1 8.37329 2.90279 8.37329 5.25C8.37329 5.56256 8.40703 5.86723 8.47107 6.16058C6.16406 7.56417 4.62329 10.1022 4.62329 13L4.62356 13.0659C2.63392 13.42 1.12329 15.1586 1.12329 17.25C1.12329 19.5972 3.02608 21.5 5.37329 21.5C6.6957 21.5 7.87705 20.896 8.65652 19.9489C9.82568 20.6177 11.1798 21 12.6233 21C14.0667 21 15.4209 20.6177 16.5901 19.9489C17.3695 20.896 18.5509 21.5 19.8733 21.5C22.2205 21.5 24.1233 19.5972 24.1233 17.25C24.1233 15.1586 22.6127 13.42 20.623 13.0659L20.6233 13C20.6233 10.1022 19.0825 7.56418 16.7755 6.16059ZM18.6204 13.1877C18.6223 13.1254 18.6233 13.0628 18.6233 13C18.6233 10.8917 17.5359 9.03735 15.8913 7.96726C15.1117 8.90383 13.9371 9.5 12.6233 9.5C11.3095 9.5 10.1349 8.90383 9.35528 7.96726C7.71071 9.03735 6.62329 10.8917 6.62329 13C6.62329 13.0628 6.62426 13.1254 6.62617 13.1877C8.36185 13.7224 9.62329 15.3389 9.62329 17.25C9.62329 17.5559 9.59096 17.8543 9.52954 18.1419C10.4329 18.6866 11.4915 19 12.6233 19C13.7551 19 14.8137 18.6866 15.717 18.1419C15.6556 17.8543 15.6233 17.5559 15.6233 17.25C15.6233 15.3389 16.8847 13.7224 18.6204 13.1877Z"/></g><defs><clipPath id="svg_5b44814902__clip0_8699_130827"><rect x=".623" width="24" height="24" rx="6"/></clipPath></defs></svg>;
}

const IconCozSceneFill = React.forwardRef(IconCozSceneFillComponent);
export default IconCozSceneFill;
