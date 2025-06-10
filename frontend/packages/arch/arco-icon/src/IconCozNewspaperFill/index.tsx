import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozNewspaperFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_newspaper_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M5.99892 14.9999V12.9999H7.99891V14.9999H5.99892Z"/><path fillRule="evenodd" clipRule="evenodd" d="M3.02459 21C1.90631 21 0.999756 20.0935 0.999756 18.9752V5.02483C0.999756 3.90655 1.9063 3 3.02459 3L17.9796 3C19.0979 3 20.0045 3.90655 20.0045 5.02483V18.5007C20.0045 18.7764 20.228 19 20.5038 19C20.7796 19 21.0032 18.7764 21.0032 18.5007V5C22.1059 5 22.9999 5.89397 22.9999 6.99674L22.9999 18.9752C22.9999 20.0935 22.0934 21 20.9751 21L3.02459 21ZM3.9999 8C3.9999 7.44772 4.4483 7 5.00143 7H15.9984C16.5515 7 16.9999 7.44772 16.9999 8C16.9999 8.55228 16.5515 9 15.9984 9H5.00143C4.4483 9 3.9999 8.55228 3.9999 8ZM12.9976 11C12.4466 11 11.9999 11.4477 11.9999 12C11.9999 12.5523 12.4466 13 12.9976 13H16.0022C16.5532 13 16.9999 12.5523 16.9999 12C16.9999 11.4477 16.5532 11 16.0022 11H12.9976ZM11.9999 16C11.9999 15.4477 12.4466 15 12.9976 15H16.0022C16.5532 15 16.9999 15.4477 16.9999 16C16.9999 16.5523 16.5532 17 16.0022 17H12.9976C12.4466 17 11.9999 16.5523 11.9999 16ZM3.99892 11.9999C3.99892 11.4476 4.44664 10.9999 4.99892 10.9999H8.99891C9.5512 10.9999 9.99891 11.4476 9.99891 11.9999V15.9999C9.99891 16.5522 9.5512 16.9999 8.99891 16.9999H4.99892C4.44664 16.9999 3.99892 16.5522 3.99892 15.9999V11.9999Z"/></svg>;
}

const IconCozNewspaperFill = React.forwardRef(IconCozNewspaperFillComponent);
export default IconCozNewspaperFill;
