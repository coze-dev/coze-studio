import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozCardComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_card${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M20.9998 3.00006C22.1043 3.00006 22.9998 3.89549 22.9998 5.00006V19.0001C22.9998 20.1046 22.1043 21.0001 20.9998 21.0001H2.99976C1.89519 21.0001 0.999756 20.1046 0.999756 19.0001V5.00006C0.999756 3.89549 1.89519 3.00006 2.99976 3.00006H20.9998ZM2.99976 5.00006V19.0001H20.9998V5.00006H2.99976ZM4.99976 12.0001C4.99976 11.4478 5.44747 11.0001 5.99976 11.0001H8.99976C9.55204 11.0001 9.99976 11.4478 9.99976 12.0001C9.99976 12.5523 9.55204 13.0001 8.99976 13.0001H5.99976C5.44747 13.0001 4.99976 12.5523 4.99976 12.0001ZM4.99976 16.0001C4.99976 15.4478 5.44747 15.0001 5.99976 15.0001H11.9998C12.552 15.0001 12.9998 15.4478 12.9998 16.0001C12.9998 16.5523 12.552 17.0001 11.9998 17.0001L5.99976 17.0001C5.44747 17.0001 4.99976 16.5523 4.99976 16.0001ZM17.9998 7.00006C18.552 7.00006 18.9998 7.44778 18.9998 8.00006V12.0001C18.9998 12.5523 18.552 13.0001 17.9998 13.0001H13.9998C13.4475 13.0001 12.9998 12.5523 12.9998 12.0001V8.00006C12.9998 7.44778 13.4475 7.00006 13.9998 7.00006H17.9998ZM14.9998 9.00006V11.0001H16.9998V9.00006H14.9998Z"/></svg>;
}

const IconCozCard = React.forwardRef(IconCozCardComponent);
export default IconCozCard;
