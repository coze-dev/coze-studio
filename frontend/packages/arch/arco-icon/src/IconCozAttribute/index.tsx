import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozAttributeComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_attribute${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M12 5.00003C12.8284 5.00003 13.5 4.32846 13.5 3.50003 13.5 2.6716 12.8284 2.00003 12 2.00003 11.1716 2.00003 10.5 2.6716 10.5 3.50003 10.5 4.32846 11.1716 5.00003 12 5.00003zM10.5 6.50003C9.94771 6.50003 9.5 6.94775 9.5 7.50003 9.5 8.05232 9.94771 8.50003 10.5 8.50003H11V19.5H10C9.44771 19.5 9 19.9477 9 20.5 9 21.0523 9.44771 21.5 10 21.5H14C14.5523 21.5 15 21.0523 15 20.5 15 19.9477 14.5523 19.5 14 19.5H13V7.50003C13 6.94775 12.5523 6.50003 12 6.50003H10.5zM24.0003 12.4934C24.0017 12.6656 23.9585 12.8404 23.8662 13.0002L19.8662 19.9285C19.5901 20.4067 18.9785 20.5706 18.5002 20.2945 18.0219 20.0183 17.858 19.4067 18.1342 18.9285L21.8456 12.5001 18.1341 6.07171C17.858 5.59342 18.0219 4.98183 18.5002 4.70569 18.9785 4.42954 19.59 4.59342 19.8662 5.07171L23.8635 11.9952 23.8733 12.0124C23.9584 12.1647 23.9994 12.33 24.0003 12.4934zM.134142 13.0002C.041828 12.8403-.00131164 12.6655.0000303493 12.4933.00094371 12.33.0419606 12.1646.127082 12.0123L.136894 11.9951 4.13416 5.07166C4.4103 4.59336 5.02189 4.42949 5.50018 4.70563 5.97847 4.98177 6.14235 5.59336 5.86621 6.07166L2.15478 12.5 5.86619 18.9284C6.14233 19.4067 5.97846 20.0183 5.50017 20.2944 5.02187 20.5706 4.41028 20.4067 4.13414 19.9284L.134142 13.0002z"/></svg>;
}

const IconCozAttribute = React.forwardRef(IconCozAttributeComponent);
export default IconCozAttribute;
