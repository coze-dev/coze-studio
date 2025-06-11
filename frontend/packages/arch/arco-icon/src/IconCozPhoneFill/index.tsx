import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozPhoneFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_phone_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M7.41628 16.6662C11.7847 21.0346 16.1532 21.9189 19.2673 22.0786C20.0937 22.121 20.8352 21.6013 21.1323 20.8289L21.914 18.7964C22.2912 17.8158 21.8452 16.7105 20.8931 16.2661L17.7694 14.8084C17.1365 14.513 16.3953 14.5693 15.8142 14.9567L14.9336 15.5437C14.6026 15.7644 14.1939 15.8577 13.8128 15.7437C13.0836 15.5255 11.9885 15.0159 10.5276 13.5549C9.06662 12.094 8.55694 10.9989 8.33881 10.2697C8.2248 9.88858 8.31808 9.47988 8.53875 9.14887L9.12581 8.26828C9.51323 7.68715 9.56943 6.94601 9.27407 6.31311L7.81635 3.18942C7.37203 2.23729 6.2667 1.79132 5.28603 2.1685L3.2536 2.9502C2.48122 3.24727 1.9615 3.98876 2.00388 4.81522C2.16357 7.9293 3.04783 12.2977 7.41628 16.6662Z"/></svg>;
}

const IconCozPhoneFill = React.forwardRef(IconCozPhoneFillComponent);
export default IconCozPhoneFill;
