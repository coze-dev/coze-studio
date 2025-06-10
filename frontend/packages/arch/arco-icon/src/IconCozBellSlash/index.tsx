import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozBellSlashComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_bell_slash${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M3.21736 1.70329C2.82683 1.31277 2.19367 1.31277 1.80314 1.7033 1.41262 2.09382 1.41262 2.72699 1.80315 3.11751L20.8943 22.2085C21.2848 22.5991 21.918 22.5991 22.3085 22.2085 22.699 21.818 22.699 21.1848 22.3085 20.7943L3.21736 1.70329zM4.00007 11.1741C4.00007 10.0625 4.21283 9.00222 4.5986 8.03426L6.18652 9.62216C6.06478 10.1193 6.00007 10.6402 6.00007 11.1769L5.99998 17.5375H14.1019L16.102 19.5375H3C2.44772 19.5375 2.00001 19.0898 2 18.5376 1.99999 17.9853 2.44771 17.5375 3 17.5375H3.99998L4.00007 11.1741zM18.0001 11.1769L18 14.3645 20 16.3645 20.0001 11.1741C20.0001 7.32615 17.4505 4.09291 14.0001 3.17618V2.91602C14.0001 2.36602 13.5501 1.91602 13.0001 1.91602H11.0001C10.4501 1.91602 10.0001 2.36602 10.0001 2.91602V3.17618C9.20855 3.38648 8.46444 3.71867 7.78763 4.15222L9.24762 5.6122C10.072 5.1673 11.0079 4.91602 12.0001 4.91602 15.3138 4.91602 18.0001 7.7191 18.0001 11.1769zM8.75012 22.0375C8.75012 21.4853 9.19784 21.0375 9.75012 21.0375H14.2501C14.8024 21.0375 15.2501 21.4853 15.2501 22.0375 15.2501 22.5898 14.8024 23.0375 14.2501 23.0375H9.75012C9.19784 23.0375 8.75012 22.5898 8.75012 22.0375z"/></svg>;
}

const IconCozBellSlash = React.forwardRef(IconCozBellSlashComponent);
export default IconCozBellSlash;
