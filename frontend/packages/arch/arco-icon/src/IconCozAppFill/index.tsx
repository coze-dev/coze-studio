import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozAppFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_app_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M13.7502 1.01066C12.6673.385444 11.3331.385444 10.2502 1.01066L3.35791 4.98993C3.11837 5.12823 2.89918 5.29247 2.70305 5.47795L11.9998 10.8454 21.297 5.47762C21.101 5.29228 20.8819 5.12815 20.6425 4.98993L13.7502 1.01066zM22.2972 7.20956L13.0002 12.5772V23.3131C13.2588 23.2359 13.5107 23.1282 13.7502 22.9899L20.6425 19.0107C21.7254 18.3854 22.3925 17.23 22.3925 15.9796V8.02102C22.3925 7.74431 22.3598 7.47225 22.2972 7.20956zM1.60791 8.02102C1.60791 7.74447 1.64054 7.47257 1.70308 7.21002L11.0002 12.5777V23.313C10.7415 23.2359 10.4897 23.1282 10.2502 22.9899L3.35791 19.0107C2.27501 18.3854 1.60791 17.23 1.60791 15.9796V8.02102z"/></svg>;
}

const IconCozAppFill = React.forwardRef(IconCozAppFillComponent);
export default IconCozAppFill;
