import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozSceneComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_scene${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M19.9997 13.0659L20 13C20 10.1022 18.4592 7.56418 16.1522 6.16059C16.2163 5.86723 16.25 5.56256 16.25 5.25C16.25 2.90279 14.3472 1 12 1C9.65279 1 7.75 2.90279 7.75 5.25C7.75 5.56256 7.78374 5.86723 7.84778 6.16058C5.54077 7.56417 4 10.1022 4 13L4.00027 13.0659C2.01063 13.42 0.5 15.1586 0.5 17.25C0.5 19.5972 2.40279 21.5 4.75 21.5C6.07241 21.5 7.25376 20.896 8.03323 19.9489C9.20238 20.6177 10.5565 21 12 21C13.4435 21 14.7976 20.6177 15.9668 19.9489C16.7462 20.896 17.9276 21.5 19.25 21.5C21.5972 21.5 23.5 19.5972 23.5 17.25C23.5 15.1586 21.9894 13.42 19.9997 13.0659ZM15.268 7.96726C14.4884 8.90383 13.3138 9.5 12 9.5C10.6862 9.5 9.51158 8.90383 8.73199 7.96726C7.08742 9.03735 6 10.8917 6 13C6 13.0628 6.00096 13.1254 6.00288 13.1877C7.73856 13.7224 9 15.3389 9 17.25C9 17.5559 8.96767 17.8543 8.90625 18.1419C9.80962 18.6866 10.8682 19 12 19C13.1318 19 14.1904 18.6866 15.0938 18.1419C15.0323 17.8543 15 17.5559 15 17.25C15 15.3389 16.2614 13.7224 17.9971 13.1877C17.999 13.1254 18 13.0628 18 13C18 10.8917 16.9126 9.03735 15.268 7.96726ZM13.75 5.24997C13.75 6.21647 12.9665 6.99997 12 6.99997C11.0335 6.99997 10.25 6.21647 10.25 5.24997C10.25 4.28348 11.0335 3.49997 12 3.49997C12.9665 3.49997 13.75 4.28348 13.75 5.24997ZM4.75 19C5.7165 19 6.5 18.2165 6.5 17.25C6.5 16.2835 5.7165 15.5 4.75 15.5C3.7835 15.5 3 16.2835 3 17.25C3 18.2165 3.7835 19 4.75 19ZM21 17.25C21 18.2165 20.2165 19 19.25 19C18.2835 19 17.5 18.2165 17.5 17.25C17.5 16.2835 18.2835 15.5 19.25 15.5C20.2165 15.5 21 16.2835 21 17.25Z"/></svg>;
}

const IconCozScene = React.forwardRef(IconCozSceneComponent);
export default IconCozScene;
