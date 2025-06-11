import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozBellComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_bell${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M10.0001 3.17618V2.91602C10.0001 2.36602 10.4501 1.91602 11.0001 1.91602H13.0001C13.5501 1.91602 14.0001 2.36602 14.0001 2.91602V3.17618C17.4505 4.09291 20.0001 7.32615 20.0001 11.1741L20 17.5375H21C21.5523 17.5375 22 17.9852 22 18.5375C22 19.0898 21.5523 19.5375 21 19.5375H3C2.44772 19.5375 2.00001 19.0898 2 18.5376C1.99999 17.9853 2.44771 17.5375 3 17.5375H3.99998L4.00007 11.1741C4.00007 7.32615 6.54962 4.09291 10.0001 3.17618ZM5.99998 17.5375H18L18.0001 11.1769C18.0001 7.7191 15.3138 4.91602 12.0001 4.91602C8.68636 4.91602 6.00007 7.7191 6.00007 11.1769L5.99998 17.5375ZM8.75012 22.0375C8.75012 21.4852 9.19784 21.0375 9.75012 21.0375H14.2501C14.8024 21.0375 15.2501 21.4852 15.2501 22.0375C15.2501 22.5898 14.8024 23.0375 14.2501 23.0375H9.75012C9.19784 23.0375 8.75012 22.5898 8.75012 22.0375Z"/></svg>;
}

const IconCozBell = React.forwardRef(IconCozBellComponent);
export default IconCozBell;
