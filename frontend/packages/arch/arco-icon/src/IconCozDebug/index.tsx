import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozDebugComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_debug${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M4.56643 3.15225L4.56652 3.15234L6.00166 4.58748L7.05035 5.63617L8.46457 7.05039L7.05035 8.4646L5.63614 7.05039L4.58758 6.00183L3.15231 4.56655C2.72492 5.1391 2.39787 5.76287 2.17114 6.41381C1.32731 8.8365 1.87321 11.6356 3.80885 13.5712C5.66617 15.4286 8.31851 16.0063 10.6705 15.3046L16.8743 21.5084C17.6554 22.2895 18.9217 22.2895 19.7028 21.5084L21.5091 19.7021C22.2901 18.9211 22.2901 17.6548 21.5091 16.8737L15.3052 10.6698C16.0069 8.31788 15.4292 5.66555 13.5719 3.80824C11.636 1.87235 8.83637 1.32655 6.41347 2.17086C5.76259 2.39767 5.13889 2.7248 4.56643 3.15225ZM8.068 3.82539L9.87878 5.63617L11.293 7.05039L9.87878 8.4646L8.46457 9.87881L7.05036 11.293L5.63614 9.87881L3.82586 8.06853C3.64175 9.52153 4.10781 11.0418 5.22306 12.157C6.54037 13.4743 8.42246 13.8882 10.0986 13.3881L11.2414 13.0471L12.0847 13.8903L18.2886 20.0942L20.0949 18.2879L13.891 12.084L13.0477 11.2408L13.3887 10.098C13.8888 8.42183 13.4749 6.53976 12.1576 5.22245C11.0421 4.10691 9.52135 3.6409 8.068 3.82539Z"/></svg>;
}

const IconCozDebug = React.forwardRef(IconCozDebugComponent);
export default IconCozDebug;
