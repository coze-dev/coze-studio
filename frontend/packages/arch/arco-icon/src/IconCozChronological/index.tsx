import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozChronologicalComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_chronological${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M6.01651 21.9997C5.66239 22.0084 5.31469 21.8282 5.12511 21.4999L1.62511 15.4377C1.34897 14.9594 1.51284 14.3478 1.99113 14.0717 2.46943 13.7955 3.08102 13.9594 3.35716 14.4377L5.00005 17.2833 5.00004 2.99988C5.00004 2.44759 5.44776 1.99988 6.00004 1.99988 6.55233 1.99988 7.00004 2.44759 7.00004 2.99988L7.00005 20.9999C7.00005 21.5467 6.5612 21.9909 6.01651 21.9997zM8.50004 5.38459L8.50004 3.06723C9.85261 2.38453 11.3814 2 12.9999 2 18.5228 2 22.9999 6.47715 22.9999 12 22.9999 17.5228 18.5228 22 12.9999 22 11.3814 22 9.85261 21.6155 8.50005 20.9328V18.6154C9.78213 19.4892 11.3314 20 12.9999 20 17.4182 20 20.9999 16.4183 20.9999 12 20.9999 7.58172 17.4182 4 12.9999 4 11.3314 4 9.78213 4.51082 8.50004 5.38459z"/><path d="M18 12C18 12.5523 17.5523 13 17 13H13C12.4478 13 12 12.5523 12 12V8C12 7.44772 12.4478 7 13 7C13.5523 7 14 7.44771 14 8V11H17C17.5523 11 18 11.4477 18 12Z"/></svg>;
}

const IconCozChronological = React.forwardRef(IconCozChronologicalComponent);
export default IconCozChronological;
