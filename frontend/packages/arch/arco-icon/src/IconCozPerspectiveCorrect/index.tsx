import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozPerspectiveCorrectComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_perspective_correct${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M11.8114 2.30726C11.936 2.28332 12.064 2.28332 12.1887 2.30726L21.3826 4.07342C21.8856 4.17004 22.2343 4.63106 22.1903 5.14134L21.1515 17.1922C21.1224 17.5291 20.9251 17.8285 20.6269 17.988L12.4718 22.3513C12.177 22.509 11.823 22.509 11.5283 22.3513L3.37319 17.988C3.07503 17.8285 2.87768 17.5291 2.84864 17.1922L1.80977 5.14135C1.76578 4.63107 2.11445 4.17004 2.61742 4.07342L11.8114 2.30726ZM3.92101 6.34571C4.64075 6.50316 5.54771 6.69316 6.49348 6.88806C8.01504 7.20161 9.69431 7.53915 11 7.79869V19.8004L4.79469 16.4803L3.92101 6.34571ZM13 19.8004L19.2054 16.4803L20.079 6.34571C19.3593 6.50316 18.4523 6.69316 17.5066 6.88806C15.985 7.20161 14.3057 7.53915 13 7.79869V19.8004ZM12 5.95805C13.1294 5.73466 14.6904 5.42251 16.1999 5.11438L12 4.30759L7.80014 5.11438C9.30964 5.42251 10.8707 5.73466 12 5.95805Z"/></svg>;
}

const IconCozPerspectiveCorrect = React.forwardRef(IconCozPerspectiveCorrectComponent);
export default IconCozPerspectiveCorrect;
