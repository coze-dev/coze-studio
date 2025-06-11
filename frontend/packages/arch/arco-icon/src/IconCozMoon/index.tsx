import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozMoonComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_moon${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M16.5665 14.9571C13.1434 14.0399 11.112 10.5214 12.0292 7.09833C12.3678 5.83474 12.8871 5.10841 13.6805 3.90277C14.686 2.37499 14.4494 1.2685 13.2222 1.15276C8.63888 0.720503 3.41963 3.81246 1.98865 9.15298C0.416286 15.0211 3.89869 21.0528 9.76682 22.6252C15.8855 24.2647 20.9063 20.0972 22.2361 17.1944C22.7495 16.0738 21.7778 14.9571 20.25 15.0555C18.8097 15.1483 17.8301 15.2957 16.5665 14.9571ZM19.7406 16.8711C20.0126 16.8201 20.2296 17.1137 20.0685 17.3387C17.9092 20.3528 14.0342 21.8706 10.2413 20.8543C5.35121 19.544 2.44921 14.5176 3.75951 9.62748C4.77582 5.83455 8.02778 3.23768 11.7177 2.87474C11.9931 2.84765 12.1389 3.18241 11.9587 3.39248C11.1807 4.29982 10.5886 5.39143 10.2584 6.62383C9.07908 11.0249 11.6909 15.5487 16.092 16.728C17.3244 17.0582 18.5658 17.0912 19.7406 16.8711Z"/></svg>;
}

const IconCozMoon = React.forwardRef(IconCozMoonComponent);
export default IconCozMoon;
