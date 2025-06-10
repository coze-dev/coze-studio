import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozLarkFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_lark_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M6.01199 3.81577C8.69744 6.04458 11.0024 8.7572 12.7609 11.7607L14.4978 10.0456C15.3214 9.2383 16.308 8.60227 17.3789 8.18641 16.8924 6.53655 16.096 5.01443 15.0115 3.65812 14.881 3.49503 14.6853 3.3999 14.4733 3.3999H6.16148C5.94132 3.3999 5.84347 3.67443 6.01199 3.81577zM10.834 14.8022C12.0952 15.3404 13.408 15.7943 14.748 16.1558 17.129 16.8 19.3904 15.8378 20.5049 13.7068L21.8557 11.016C22.1574 10.3582 22.5407 9.74934 23 9.19485 22.1901 8.89586 21.3366 8.74365 20.4559 8.74365 18.5125 8.74365 16.6805 9.49384 15.2943 10.8529L13.2313 12.8914C12.5002 13.6117 11.6956 14.2532 10.834 14.8022z"/><path d="M1 10.0567C1 9.8501 1.24734 9.7441 1.39684 9.88815C5.05263 13.4216 9.43687 15.8951 14.4571 17.2487C15.6449 17.5694 16.8246 17.5504 17.8982 17.2351C17.2296 17.882 16.493 18.4582 15.6993 18.9556C13.5901 20.2766 11.1547 20.9724 8.65678 20.9724C6.02842 20.9724 3.48975 20.2086 1.30986 18.7599C1.11959 18.6349 1.00544 18.4202 1.00544 18.1864L1 10.0567Z"/></svg>;
}

const IconCozLarkFill = React.forwardRef(IconCozLarkFillComponent);
export default IconCozLarkFill;
