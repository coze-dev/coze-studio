import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozEyeCloseComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_eye_close${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M2.03147 8.17212C2.48868 7.86232 3.11047 7.98182 3.42027 8.43903C5.26304 11.1586 8.63652 13 12 13C15.3635 13 18.737 11.1586 20.5798 8.43903C20.8896 7.98182 21.5114 7.86232 21.9686 8.17212C22.4258 8.48193 22.5453 9.10371 22.2355 9.56092C21.674 10.3896 20.9973 11.1486 20.2339 11.8197L22.2426 13.8284C22.6332 14.2189 22.6332 14.8521 22.2426 15.2426C21.8521 15.6331 21.219 15.6331 20.8284 15.2426L18.7071 13.1213C18.6765 13.0907 18.6483 13.0586 18.6225 13.0252C17.8777 13.4967 17.0825 13.8942 16.2551 14.2062L16.9671 16.8637C17.1101 17.3972 16.7935 17.9455 16.26 18.0884C15.7266 18.2314 15.1782 17.9148 15.0353 17.3813L14.3333 14.7617C13.5659 14.9178 12.7839 15 12 15C11.2891 15 10.5798 14.9324 9.88141 14.8033L9.19064 17.3813C9.0477 17.9148 8.49936 18.2314 7.9659 18.0884C7.43243 17.9455 7.11585 17.3972 7.25879 16.8637L7.95063 14.2817C7.03654 13.9548 6.1595 13.5237 5.34352 13.0036C5.31343 13.0448 5.2798 13.0841 5.24263 13.1213L3.12131 15.2426C2.73078 15.6332 2.09762 15.6332 1.70709 15.2426C1.31657 14.8521 1.31657 14.219 1.70709 13.8284L3.73938 11.7961C2.98693 11.1308 2.31951 10.3799 1.76456 9.56092C1.45476 9.10371 1.57426 8.48193 2.03147 8.17212Z"/></svg>;
}

const IconCozEyeClose = React.forwardRef(IconCozEyeCloseComponent);
export default IconCozEyeClose;
