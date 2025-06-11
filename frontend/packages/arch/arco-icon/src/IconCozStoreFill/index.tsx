import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozStoreFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_store_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M5.2121 1.96973C3.71097 1.9697 2.43258 3.06105 2.19712 4.54361L1.49102 8.98943C1.45289 9.22953 1.41662 9.53906 1.44667 9.87538 1.64213 12.0634 3.41115 13.8526 5.65457 13.8526 6.9358 13.8526 8.06129 13.2703 8.82796 12.3629 9.59463 13.2703 10.7201 13.8526 12.0013 13.8526 13.2826 13.8526 14.4074 13.2704 15.1736 12.3632 15.9403 13.2705 17.0656 13.8526 18.3467 13.8526 20.5912 13.8526 22.3608 12.0617 22.5549 9.87226 22.5845 9.5385 22.5488 9.23134 22.5112 8.99302L21.8106 4.54746C21.5767 3.06329 20.2977 1.96997 18.7952 1.96995L5.2121 1.96973zM3.00395 20.0094L3.00391 14.6895C3.78672 15.1108 4.68423 15.3526 5.65451 15.3526 6.84263 15.3526 7.92974 14.9849 8.82789 14.3686 9.72602 14.9849 10.8131 15.3526 12.0013 15.3526 13.1893 15.3526 14.276 14.985 15.1737 14.3689 16.0718 14.985 17.1587 15.3526 18.3466 15.3526 19.3197 15.3526 20.2196 15.1094 21.004 14.6859V20.0094C21.004 21.1139 20.1085 22.0094 19.0039 22.0094H14.5C13.9477 22.0094 13.5 21.5616 13.5 21.0094V19C13.5 18.4477 13.0523 18 12.5 18H11.5C10.9477 18 10.5 18.4477 10.5 19V21.0094C10.5 21.5616 10.0523 22.0094 9.5 22.0094H5.00395C3.89938 22.0094 3.00395 21.1139 3.00395 20.0094z"/></svg>;
}

const IconCozStoreFill = React.forwardRef(IconCozStoreFillComponent);
export default IconCozStoreFill;
