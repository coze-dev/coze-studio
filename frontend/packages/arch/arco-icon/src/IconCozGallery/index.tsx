import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozGalleryComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_gallery${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M2 4C2 2.89543 2.89543 2 4 2H9C10.1046 2 11 2.89543 11 4V9C11 10.1046 10.1046 11 9 11H4C2.89543 11 2 10.1046 2 9V4zM4 4H9V9H4L4 4zM2 15C2 13.8954 2.89543 13 4 13H9C10.1046 13 11 13.8954 11 15V20C11 21.1046 10.1046 22 9 22H4C2.89543 22 2 21.1046 2 20V15zM4 15H9V20H4L4 15zM15 13C13.8954 13 13 13.8954 13 15V20C13 21.1046 13.8954 22 15 22H20C21.1046 22 22 21.1046 22 20V15C22 13.8954 21.1046 13 20 13H15zM20 15H15V20H20V15z"/><path d="M20.75 2.25C21.3023 2.25 21.75 2.69772 21.75 3.25L21.75 3.25395V9.25C21.75 9.80229 21.3023 10.25 20.75 10.25C20.1977 10.25 19.75 9.80229 19.75 9.25V5.66422L14.9571 10.4571C14.5666 10.8476 13.9334 10.8476 13.5429 10.4571C13.1524 10.0666 13.1524 9.43341 13.5429 9.04289L18.3358 4.25H14.75C14.1977 4.25 13.75 3.80228 13.75 3.25C13.75 2.69772 14.1977 2.25 14.75 2.25H20.75Z"/></svg>;
}

const IconCozGallery = React.forwardRef(IconCozGalleryComponent);
export default IconCozGallery;
