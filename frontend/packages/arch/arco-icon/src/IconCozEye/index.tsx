import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozEyeComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_eye${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M11.9848 18.5C15.2227 18.5 18.2207 16.4404 21 11.987C18.2922 7.54956 15.3011 5.5 11.9848 5.5C8.66962 5.5 5.68921 7.54864 2.99999 11.987C5.76066 16.4413 8.74796 18.5 11.9848 18.5ZM1.50244 12.89C1.18044 12.3419 1.17826 11.6605 1.49282 11.1081C1.50402 11.0884 1.51477 11.0697 1.52494 11.052C4.42801 6.01734 7.91426 3.5 11.9837 3.5C16.0697 3.5 19.5776 6.03792 22.5071 11.1138C22.5159 11.129 22.5251 11.145 22.5347 11.1618C22.8311 11.6808 22.8288 12.3215 22.5257 12.8366C19.5188 17.9455 16.0048 20.5 11.9837 20.5C7.97662 20.5 4.48287 17.9633 1.50244 12.89ZM12 16C9.79086 16 7.99999 14.2091 7.99999 12C7.99999 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12C16 14.2091 14.2091 16 12 16ZM12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 9.99999 10.8954 9.99999 12C9.99999 13.1046 10.8954 14 12 14Z"/></svg>;
}

const IconCozEye = React.forwardRef(IconCozEyeComponent);
export default IconCozEye;
