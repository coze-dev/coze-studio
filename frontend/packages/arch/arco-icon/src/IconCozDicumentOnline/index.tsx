import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozDicumentOnlineComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_dicument_online${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M18.9999 3.00003H4.99988V21H7.83947C8.03027 21.7413 8.37644 22.4203 8.8412 23H4.99988C3.89531 23 2.99988 22.1046 2.99988 21V3.00003C2.99988 1.89546 3.89531 1.00003 4.99988 1.00003H18.9999C20.1044 1.00003 20.9999 1.89546 20.9999 3.00003V12.8695C20.4385 12.288 19.7614 11.8142 18.9999 11.4891V3.00003Z"/><path d="M6.99988 7.00003C6.99988 6.44775 7.44759 6.00003 7.99988 6.00003H15.9999C16.5522 6.00003 16.9999 6.44775 16.9999 7.00003 16.9999 7.55232 16.5522 8.00003 15.9999 8.00003H7.99988C7.44759 8.00003 6.99988 7.55232 6.99988 7.00003zM7.99988 10.5C7.44759 10.5 6.99988 10.9477 6.99988 11.5 6.99988 12.0523 7.44759 12.5 7.99988 12.5H10.9999C11.5522 12.5 11.9999 12.0523 11.9999 11.5 11.9999 10.9477 11.5522 10.5 10.9999 10.5H7.99988zM16.5871 13C14.5406 13 12.8744 14.4729 12.5151 16.3691 10.9063 16.606 9.67145 17.9921 9.67145 19.6667 9.67145 21.5076 11.1638 23 13.0048 23H19.6508C21.6865 23 23.2251 21.1564 22.861 19.1535 22.6469 17.9759 21.8102 17.0256 20.7034 16.6487 20.4633 14.6431 18.7579 13 16.5871 13zM12.8064 18.3478L14.215 18.1404 14.4801 16.7414C14.6664 15.7583 15.533 15 16.5871 15 17.7031 15 18.5928 15.8438 18.7176 16.8864L18.8672 18.1362 20.0588 18.5419C20.4869 18.6877 20.8105 19.0561 20.8932 19.5113 21.0342 20.2865 20.4387 21 19.6508 21H13.0048C12.2684 21 11.6714 20.4031 11.6714 19.6667 11.6714 18.9986 12.1647 18.4422 12.8064 18.3478z"/></svg>;
}

const IconCozDicumentOnline = React.forwardRef(IconCozDicumentOnlineComponent);
export default IconCozDicumentOnline;
