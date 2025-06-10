import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozPageComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_page${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M3 4.2C3 3.0799 3 2.51984 3.21799 2.09202C3.40973 1.71569 3.71569 1.40973 4.09202 1.21799C4.51984 1 5.0799 1 6.2 1H13.6745C14.1636 1 14.4082 1 14.6384 1.05526C14.8425 1.10425 15.0376 1.18506 15.2165 1.29472C15.4184 1.4184 15.5913 1.59136 15.9372 1.93726L20.0627 6.06272C20.4086 6.40862 20.5815 6.58157 20.7052 6.7834C20.8149 6.96235 20.8957 7.15744 20.9447 7.36151C20.9999 7.59169 20.9999 7.83628 20.9999 8.32546V19.8C20.9999 20.9201 20.9999 21.4802 20.7819 21.908C20.5902 22.2843 20.2842 22.5903 19.9079 22.782C19.4801 23 18.92 23 17.7999 23H6.2C5.07989 23 4.51984 23 4.09202 22.782C3.71569 22.5903 3.40973 22.2843 3.21799 21.908C3 21.4802 3 20.9201 3 19.8V4.2ZM6.2 3H13.6745C13.8165 3 13.9199 3.00014 14 3.00096V5.12001C14 6.1281 14 6.63215 14.1962 7.01719C14.3688 7.35588 14.6441 7.63124 14.9828 7.80381C15.3679 8 15.8719 8 16.88 8H18.999C18.9998 8.08008 18.9999 8.18351 18.9999 8.32546V19.8C18.9999 20.3931 18.9984 20.7176 18.9793 20.9507L18.977 20.9771L18.9507 20.9794C18.7175 20.9984 18.393 21 17.7999 21H6.2C5.60694 21 5.28244 20.9984 5.04927 20.9794L5.0229 20.9771L5.02061 20.9507C5.00156 20.7176 5 20.3931 5 19.8V4.2C5 3.60695 5.00156 3.28244 5.02061 3.04927L5.0229 3.0229L5.04927 3.02061C5.28244 3.00156 5.60695 3 6.2 3Z"/></svg>;
}

const IconCozPage = React.forwardRef(IconCozPageComponent);
export default IconCozPage;
