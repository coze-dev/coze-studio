import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozLessEqualComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_less_equal${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 25 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M16.5686 4.41012C17.0789 4.19877 17.6639 4.44107 17.8752 4.95132 18.0866 5.46156 17.8443 6.04653 17.334 6.25788L8.01701 10.1171 17.3338 13.9762C17.844 14.1876 18.0863 14.7726 17.875 15.2828 17.6636 15.793 17.0787 16.0354 16.5684 15.824L5.05765 11.0561C4.80485 10.963 4.59017 10.7687 4.47895 10.5002 4.44627 10.4213 4.42444 10.3407 4.41277 10.2598 4.38766 10.0875 4.40725 9.90645 4.47873 9.7339 4.59051 9.46402 4.80681 9.26911 5.06129 9.17662L16.5686 4.41012zM17.875 19.0491C18.0863 18.5388 17.844 17.9539 17.3338 17.7425L5.78529 12.959C5.27505 12.7476 4.69008 12.9899 4.47873 13.5002 4.26738 14.0104 4.50968 14.5954 5.01992 14.8067L16.5684 19.5903C17.0787 19.8016 17.6636 19.5593 17.875 19.0491z"/></svg>;
}

const IconCozLessEqual = React.forwardRef(IconCozLessEqualComponent);
export default IconCozLessEqual;
