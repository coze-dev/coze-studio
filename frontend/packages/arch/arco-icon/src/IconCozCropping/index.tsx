import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozCroppingComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_cropping${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M2 5.03674C2 3.37989 3.34315 2.03674 5 2.03674C6.29245 2.03674 7.394 2.85404 7.81604 4H16.3939C16.8159 2.85404 17.9175 2.03674 19.2099 2.03674C20.8668 2.03674 22.2099 3.37989 22.2099 5.03674C22.2099 6.42014 21.2735 7.58484 20 7.93161V16.1051C21.2736 16.4519 22.21 17.6166 22.21 19C22.21 20.6569 20.8668 22 19.21 22C17.9037 22 16.7925 21.1652 16.3807 20H7.82929C7.41746 21.1652 6.30622 22 5 22C3.34315 22 2 20.6569 2 19C2 17.6938 2.83481 16.5825 4 16.1707V7.86604C2.83481 7.4542 2 6.34296 2 5.03674ZM6 7.86604V16.1707C6.85241 16.472 7.52801 17.1476 7.82929 18H16.3807C16.6568 17.2188 17.2472 16.5862 18 16.254V7.78277C17.2354 7.4454 16.6383 6.79806 16.3679 6H7.84201C7.54733 6.86972 6.86462 7.56044 6 7.86604Z"/></svg>;
}

const IconCozCropping = React.forwardRef(IconCozCroppingComponent);
export default IconCozCropping;
