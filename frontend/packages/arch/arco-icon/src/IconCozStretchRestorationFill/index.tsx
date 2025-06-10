import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozStretchRestorationFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_stretch_restoration_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M6.20227 2.88674C5.91687 2.54615 6.14883 2 6.59319 2H17.4071C17.8514 2 18.0834 2.54615 17.798 2.88674 13.3886 8.14888 13.3886 15.8511 17.798 21.1133 18.0834 21.4539 17.8514 22 17.4071 22H6.59319C6.14883 22 5.91687 21.4539 6.20227 21.1133 10.6117 15.8511 10.6117 8.14888 6.20227 2.88674zM3.37917 2.09814L3.45421 2.17387 2.0431 3.58498C2.19111 2.88345 2.70682 2.31749 3.37917 2.09814zM5.97696 5.1022C5.55355 4.44835 5.06397 3.82484 4.50823 3.24117L2 5.7494V9.07916L5.97696 5.1022z"/><path d="M6.74123 6.45925C7.12292 7.24714 7.41843 8.06625 7.62776 8.90249L2 14.5302V11.2005L6.74123 6.45925zM7.94365 10.7079C8.06029 11.8556 8.02107 13.0162 7.82601 14.1553L2 19.9813V16.6516L7.94365 10.7079zM4.32811 20.9441C5.43378 19.8283 6.29036 18.5588 6.89786 17.2048L2.63808 21.4646C2.84807 21.6599 3.10013 21.8107 3.37917 21.9017L4.32811 20.9441zM16.0034 11.4289C16.0686 9.9724 16.383 8.52493 16.9467 7.1559L21.4646 2.63799C21.7968 2.99506 22 3.47376 22 3.99992V5.43238L16.0034 11.4289zM16.0764 13.4773C16.1833 14.3956 16.3902 15.3045 16.6971 16.1864L22 10.8835V7.5537L16.0764 13.4773zM18.608 19.7265C18.1096 19.0773 17.6824 18.3911 17.3264 17.6784L22 13.0048V16.3345L18.608 19.7265zM19.6717 20.9441L20.6207 21.9017C21.4214 21.6406 22 20.8878 22 19.9999V18.4559L19.5924 20.8634C19.6187 20.8904 19.6451 20.9173 19.6717 20.9441z"/></svg>;
}

const IconCozStretchRestorationFill = React.forwardRef(IconCozStretchRestorationFillComponent);
export default IconCozStretchRestorationFill;
