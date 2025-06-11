import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozUploadComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_upload${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M11.119 5.79534L8.46198 8.45235C8.07153 8.8428 7.43844 8.84258 7.04799 8.45213 6.65754 8.06168 6.65731 7.4286 7.04769 7.03807 7.409 6.67662 7.77026 6.31513 8.13153 5.95364 9.18451 4.90001 10.2375 3.84638 11.2915 2.79376 11.6816 2.40411 12.3136 2.40411 12.7037 2.79376 13.7586 3.84723 14.8124 4.90171 15.8662 5.95618 16.2285 6.31864 16.5907 6.68109 16.953 7.0435 17.3393 7.43001 17.3268 8.05885 16.9404 8.44528 16.554 8.83171 15.9251 8.84422 15.5387 8.45779L13.119 6.0381 13.119 16.3311C13.119 16.8833 12.6713 17.3311 12.119 17.3311 11.5667 17.3311 11.119 16.8833 11.119 16.3311L11.119 5.79534zM21 19C21 18.4477 20.5523 18 20 18 19.4477 18 19 18.4477 19 19V20H5V19C5 18.4477 4.55228 18 4 18 3.44772 18 3 18.4477 3 19V21C3 21.5523 3.44772 22 4 22H20C20.5523 22 21 21.5523 21 21V19z"/></svg>;
}

const IconCozUpload = React.forwardRef(IconCozUploadComponent);
export default IconCozUpload;
