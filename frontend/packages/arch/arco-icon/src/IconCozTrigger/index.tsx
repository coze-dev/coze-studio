import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozTriggerComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_trigger${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M10.4963 7.70199L8.1678 13.642C8.11638 13.7731 8.21311 13.9149 8.35401 13.9149H10.6911C10.8252 13.9149 10.9213 14.0443 10.8825 14.1727L9.55346 18.5804C9.49223 18.7834 9.74765 18.9296 9.89173 18.774L16.0342 12.1375C16.1527 12.0094 16.0619 11.8016 15.8874 11.8016H13.3245C13.1836 11.8016 13.0869 11.6598 13.1383 11.5286L14.5812 7.84797C14.6326 7.71679 14.5359 7.57498 14.3949 7.57498H10.6825C10.6002 7.57498 10.5263 7.62538 10.4963 7.70199Z"/><path fillRule="evenodd" clipRule="evenodd" d="M15 2H13.9118L13.6135 1.49298C13.4338 1.18754 13.1059 1 12.7516 1H11.2484C10.8941 1 10.5662 1.18754 10.3865 1.49298L10.0882 2H9C5.68629 2 3 4.68629 3 8V21H2C1.44772 21 1 21.4477 1 22C1 22.5523 1.44772 23 2 23H22C22.5523 23 23 22.5523 23 22C23 21.4477 22.5523 21 22 21H21V8C21 4.68629 18.3137 2 15 2ZM19 21V8C19 5.79086 17.2091 4 15 4H9C6.79086 4 5 5.79086 5 8V21H19Z"/></svg>;
}

const IconCozTrigger = React.forwardRef(IconCozTriggerComponent);
export default IconCozTrigger;
