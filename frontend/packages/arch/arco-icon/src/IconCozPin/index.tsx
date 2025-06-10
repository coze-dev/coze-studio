import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozPinComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_pin${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M13.694 1.89406C13.2522 1.45233 12.6332 1.50989 12.2431 1.8999C11.8653 2.27776 11.8994 2.93221 12.2797 3.30827L13.4739 4.50672L10.2733 7.70684C10.1783 7.80184 10.0068 7.81432 9.87229 7.81432L3.5612 8.24828C3.42685 8.24828 3.298 8.30328 3.20295 8.39828L2.6348 8.96513C2.23882 9.36111 2.22789 9.98952 2.63333 10.395L7.21629 14.9793L2.55475 19.6504C2.1649 20.041 2.16522 20.6736 2.55547 21.0638L2.57033 21.0787C2.96084 21.4692 3.59399 21.4692 3.98452 21.0787L8.64924 16.4143L13.2329 20.9944C13.6218 21.3833 14.2596 21.3819 14.6549 20.9852L15.224 20.4176C15.319 20.3226 15.3725 20.1926 15.3725 20.0576L15.8143 13.7543C15.8143 13.6243 15.8392 13.4662 15.9342 13.3712L19.1353 10.1711L20.3337 11.3622C20.8356 11.8642 21.4846 11.6597 21.7508 11.3934C22.1867 10.9576 22.1297 10.3299 21.7479 9.948L13.694 1.89406ZM14.9205 5.95214L17.7537 8.78226L13.926 12.6177L13.5085 18.4464L5.23903 10.172L11.1058 9.77124L14.9205 5.95214Z"/></svg>;
}

const IconCozPin = React.forwardRef(IconCozPinComponent);
export default IconCozPin;
