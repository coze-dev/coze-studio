import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozAtComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_at${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M18.75 16C17.7219 16 16.7904 15.5587 16.113 14.8439C15.2104 16.1467 13.7049 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12C17 13.1046 17.7835 14 18.75 14C20.2623 14 20.5256 12 20.5256 12C20.6058 11.4522 20.6644 11.0965 20.6644 10.4317C20.6644 6.99671 17.1639 3 12 3C6.83614 3 3.01963 6.83614 3.01963 12C3.01963 17.1639 6.83614 21.0109 12 21.0109C13.8072 21.0109 15.4873 20.3764 16.9161 19.4664C17.175 19.3015 17.5029 19.2852 17.7691 19.4382C17.7837 19.4466 17.7975 19.4545 17.8103 19.4619C18.0331 19.5899 18.334 19.763 18.7132 19.981C18.7162 19.9827 18.7192 19.9844 18.7223 19.9862C18.9737 20.1308 19.0083 20.4837 18.7801 20.6626C16.9118 22.127 14.5578 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 22.6569 5.26486 22.6569 10.4317C22.6569 10.6885 22.671 10.9539 22.5206 12.2257C22.2958 14.3265 20.7497 16 18.75 16ZM12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"/></svg>;
}

const IconCozAt = React.forwardRef(IconCozAtComponent);
export default IconCozAt;
