import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozTrayFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_tray_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M8 6C7.44772 6 7 6.44772 7 7C7 7.55228 7.44772 8 8 8H16C16.5523 8 17 7.55228 17 7C17 6.44772 16.5523 6 16 6H8Z"/><path fillRule="evenodd" clipRule="evenodd" d="M1 10.5239V19C1 20.1046 1.89543 21 3 21H21C22.1046 21 23 20.1046 23 19V10.5239C23 10.1804 22.9115 9.84274 22.7432 9.54338L19.0735 3.01948C18.7192 2.38972 18.0529 2 17.3303 2H6.66969C5.94715 2 5.28078 2.38972 4.92654 3.01948L1.25685 9.54338C1.08846 9.84274 1 10.1804 1 10.5239ZM17.3303 4H6.66969L3.29469 10H7.4232C7.78017 10 8.11007 10.1903 8.28881 10.4993L8.86808 11.5007C9.04682 11.8097 9.37672 12 9.7337 12H14.2762C14.635 12 14.9662 11.8078 15.1443 11.4964L15.712 10.5036C15.8901 10.1922 16.2214 10 16.5801 10H20.7053L17.3303 4Z"/></svg>;
}

const IconCozTrayFill = React.forwardRef(IconCozTrayFillComponent);
export default IconCozTrayFill;
