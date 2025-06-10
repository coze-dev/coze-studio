import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozLignSidesVerticallyComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_lign_sides_vertically${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 25 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M23.1233 2.30234C23.1233 2.08142 22.9443 1.90234 22.7233 1.90234H2.52329C2.30238 1.90234 2.12329 2.08142 2.12329 2.30234V3.50234C2.12329 3.72326 2.30238 3.90234 2.52329 3.90234H22.7233C22.9443 3.90234 23.1233 3.72326 23.1233 3.50234V2.30234ZM23.1233 20.5016C23.1233 20.2806 22.9443 20.1016 22.7233 20.1016H2.52329C2.30238 20.1016 2.12329 20.2806 2.12329 20.5016V21.7016C2.12329 21.9224 2.30238 22.1016 2.52329 22.1016H22.7233C22.9443 22.1016 23.1233 21.9224 23.1233 21.7016V20.5016ZM18.6229 5.10156C18.9543 5.10156 19.2229 5.3702 19.2229 5.70156V9.80156C19.2229 10.1329 18.9543 10.4016 18.6229 10.4016H6.52291C6.19153 10.4016 5.92289 10.1329 5.92289 9.80156V5.70156C5.92289 5.3702 6.19153 5.10156 6.52289 5.10156H18.6229ZM19.2229 14.2016C19.2229 13.8702 18.9543 13.6016 18.6229 13.6016H6.52289C6.19153 13.6016 5.92289 13.8702 5.92289 14.2016V18.3016C5.92289 18.6329 6.19153 18.9016 6.52291 18.9016H18.6229C18.9543 18.9016 19.2229 18.6329 19.2229 18.3016V14.2016Z"/></svg>;
}

const IconCozLignSidesVertically = React.forwardRef(IconCozLignSidesVerticallyComponent);
export default IconCozLignSidesVertically;
