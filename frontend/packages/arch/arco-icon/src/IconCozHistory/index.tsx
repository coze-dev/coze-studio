import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozHistoryComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_history${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M12 21.0001C7.02941 21.0001 2.99997 16.9706 2.99997 12.0001C2.99997 11.4478 2.55225 11.0001 1.99997 11.0001C1.44768 11.0001 0.999969 11.4478 0.999969 12.0001C0.999969 18.0752 5.92484 23.0001 12 23.0001C18.0751 23.0001 23 18.0752 23 12.0001C23 5.92493 18.0751 1.00006 12 1.00006C9.57106 1.00006 7.32453 1.78826 5.50452 3.12179L4.75187 1.98072C4.53258 1.64825 4.03155 1.69313 3.87483 2.05927L2.06344 6.29103C1.92223 6.62091 2.16419 6.98773 2.52302 6.98779L7.12617 6.98852C7.52444 6.98858 7.76292 6.54568 7.54363 6.21322L6.60736 4.79376C8.11052 3.66684 9.97649 3.00006 12 3.00006C16.9705 3.00006 21 7.0295 21 12.0001C21 16.9706 16.9705 21.0001 12 21.0001Z"/><path d="M12 8.00006C12 7.44778 11.5523 7.00006 11 7.00006C10.4477 7.00006 9.99997 7.44778 9.99997 8.00006V13.0001C9.99997 13.5523 10.4477 14.0001 11 14.0001H15C15.5523 14.0001 16 13.5523 16 13.0001C16 12.4478 15.5523 12.0001 15 12.0001H12V8.00006Z"/></svg>;
}

const IconCozHistory = React.forwardRef(IconCozHistoryComponent);
export default IconCozHistory;
