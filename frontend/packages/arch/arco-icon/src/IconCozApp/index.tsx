import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozAppComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_app${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M10.25 1.01066C11.3329 0.385444 12.6671 0.385444 13.75 1.01066L20.6423 4.98993C21.7252 5.61515 22.3923 6.77059 22.3923 8.02102V15.9796C22.3923 17.23 21.7252 18.3854 20.6423 19.0107L13.75 22.9899C12.6671 23.6151 11.3329 23.6151 10.25 22.9899L3.35767 19.0107C2.27476 18.3854 1.60767 17.23 1.60767 15.9796V8.02102C1.60767 6.77059 2.27476 5.61515 3.35767 4.98993L10.25 1.01066ZM19.3919 6.57743L12.75 2.74271C12.2859 2.47476 11.7141 2.47476 11.25 2.74271L4.60765 6.57766L11.9996 10.8454L19.3919 6.57743ZM13 12.5772V21.1135L19.6423 17.2786C20.1064 17.0107 20.3923 16.5155 20.3923 15.9796V8.30926L13 12.5772ZM3.60767 8.30972L11 12.5777V21.1135L4.35767 17.2786C3.89356 17.0107 3.60767 16.5155 3.60767 15.9796V8.30972Z"/></svg>;
}

const IconCozApp = React.forwardRef(IconCozAppComponent);
export default IconCozApp;
