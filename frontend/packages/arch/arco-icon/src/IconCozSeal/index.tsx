import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozSealComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_seal${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M7.21771 5.79276C7.21771 2.80827 9.9482 0.462528 13.0328 1.10659C14.8516 1.48628 16.3112 2.94473 16.6947 4.76172C17.0692 6.53473 16.4493 8.19439 15.2889 9.28216L16.408 12.4985H19.4997C20.6043 12.4985 21.4997 13.3939 21.4997 14.4985V17.4985C21.4997 18.0508 21.052 18.4985 20.4997 18.4985H3.4998C2.94752 18.4985 2.49981 18.0508 2.4998 17.4985L2.49976 14.4985C2.49974 13.3939 3.39517 12.4985 4.49976 12.4985L7.67989 12.4985L8.7842 9.32457C7.82704 8.45358 7.21771 7.19787 7.21771 5.79276ZM12.624 3.06438C10.8046 2.68449 9.21771 4.0537 9.21771 5.79277C9.21771 6.62581 9.58546 7.37036 10.1736 7.884C10.7501 8.3874 10.9801 9.21033 10.6822 9.95581L9.56882 13.1557C9.28909 13.9597 8.53113 14.4985 7.67989 14.4985H4.49976L4.49979 16.4985H19.4997V14.4985H16.408C15.5567 14.4985 14.7988 13.9597 14.519 13.1557L13.3914 9.91455C13.1007 9.1866 13.3103 8.37274 13.8765 7.86397C14.582 7.23046 14.9651 6.25108 14.7378 5.17486C14.518 4.13331 13.665 3.28171 12.624 3.06438Z"/><path d="M3.45459 20H20.5449C20.7962 20 20.9998 20.2264 20.9998 20.5053V21.4947C20.9998 21.7739 20.7962 22 20.5449 22H3.45459C3.2033 22 2.99976 21.7739 2.99976 21.4947V20.5053C2.99976 20.2261 3.2033 20 3.45459 20Z"/></svg>;
}

const IconCozSeal = React.forwardRef(IconCozSealComponent);
export default IconCozSeal;
