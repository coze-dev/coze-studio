import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozLinkComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_link${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M18.7173 9.52513L16.9495 11.2929C16.559 11.6834 16.559 12.3166 16.9495 12.7071C17.34 13.0976 17.9732 13.0976 18.3637 12.7071L20.1315 10.9393C22.0841 8.98672 22.0841 5.8209 20.1315 3.86827C18.1789 1.91565 15.013 1.91565 13.0604 3.86827L9.87844 7.05025C7.92582 9.00288 7.92582 12.1687 9.87844 14.1213L10.232 14.4749C10.6225 14.8654 11.2557 14.8654 11.6462 14.4749C12.0367 14.0844 12.0367 13.4512 11.6462 13.0607L11.2927 12.7071C10.1211 11.5355 10.1211 9.63604 11.2927 8.46447L14.4746 5.28249C15.6462 4.11092 17.5457 4.11092 18.7173 5.28249C19.8889 6.45406 19.8889 8.35356 18.7173 9.52513Z"/><path d="M5.28249 18.7175C4.11092 17.5459 4.11092 15.6464 5.28249 14.4749L7.05026 12.7071C7.44078 12.3166 7.44078 11.6834 7.05026 11.2929C6.65973 10.9024 6.02657 10.9024 5.63604 11.2929L3.86827 13.0607C1.91565 15.0133 1.91565 18.1791 3.86827 20.1317C5.8209 22.0843 8.98672 22.0843 10.9393 20.1317L14.1213 16.9497C16.0739 14.9971 16.0739 11.8313 14.1213 9.87868L13.7678 9.52512C13.3772 9.1346 12.7441 9.1346 12.3536 9.52512C11.963 9.91565 11.963 10.5488 12.3536 10.9393L12.7071 11.2929C13.8787 12.4645 13.8787 14.364 12.7071 15.5355L9.52513 18.7175C8.35356 19.8891 6.45406 19.8891 5.28249 18.7175Z"/></svg>;
}

const IconCozLink = React.forwardRef(IconCozLinkComponent);
export default IconCozLink;
