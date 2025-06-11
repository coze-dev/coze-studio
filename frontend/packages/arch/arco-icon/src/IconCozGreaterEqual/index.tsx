import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozGreaterEqualComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_greater_equal${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 25 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M7.78529 4.41006C7.27504 4.19871 6.69008 4.44101 6.47873 4.95126 6.26738 5.4615 6.50968 6.04647 7.01992 6.25782L16.3369 10.117 7.02015 13.9762C6.5099 14.1875 6.2676 14.7725 6.47895 15.2827 6.6903 15.793 7.27527 16.0353 7.78552 15.8239L19.2963 11.056C19.5491 10.963 19.7638 10.7687 19.875 10.5002 19.9077 10.4213 19.9295 10.3406 19.9412 10.2598 19.9663 10.0875 19.9467 9.90638 19.8752 9.73383 19.7634 9.46396 19.5471 9.26905 19.2926 9.17656L7.78529 4.41006zM6.47895 19.049C6.2676 18.5388 6.5099 17.9538 7.02015 17.7424L18.5686 12.9589C19.0789 12.7475 19.6639 12.9899 19.8752 13.5001 20.0866 14.0103 19.8443 14.5953 19.334 14.8067L7.78552 19.5902C7.27527 19.8016 6.6903 19.5592 6.47895 19.049z"/></svg>;
}

const IconCozGreaterEqual = React.forwardRef(IconCozGreaterEqualComponent);
export default IconCozGreaterEqual;
