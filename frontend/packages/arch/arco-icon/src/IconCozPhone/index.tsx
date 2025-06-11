import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozPhoneComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_phone${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 25" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M16.3409 15.3738C15.6151 15.9482 14.2871 16.4669 12.9548 15.7411C12.1384 15.2964 11.2851 14.5722 10.4188 13.706C9.54958 12.8367 8.82283 11.98 8.37828 11.1601C7.66179 9.83851 8.1692 8.52217 8.73195 7.79906L8.94692 7.52283L7.2713 3.61341L3.75409 5.06167C3.90337 7.82368 4.68021 11.6443 8.58037 15.5444C12.4805 19.4446 16.3011 20.2214 19.0631 20.3707L20.5121 16.8518L16.5983 15.1701L16.3409 15.3738ZM2.95993 3.22576L6.50981 1.76405C7.52085 1.34774 8.67882 1.82053 9.10957 2.82551L10.7852 6.73494C11.072 7.40421 10.9725 8.17652 10.5253 8.75116L10.3103 9.0274C10.0425 9.37154 9.92866 9.82346 10.1365 10.2068C10.4431 10.7723 11.0086 11.4673 11.8331 12.2917C12.6543 13.113 13.3472 13.6774 13.9115 13.9848C14.2982 14.1954 14.7545 14.0788 15.0998 13.8055L15.3571 13.6018C15.9332 13.1459 16.7129 13.0426 17.3878 13.3326L21.3016 15.0143C22.3056 15.4457 22.7775 16.6029 22.3614 17.6133L20.899 21.1649C20.5905 21.9143 19.8606 22.413 19.0511 22.3728C15.9349 22.2178 11.5505 21.343 7.16616 16.9586C2.7818 12.5743 1.90704 8.18993 1.75203 5.07369C1.71176 4.26424 2.21052 3.53434 2.95993 3.22576Z"/></svg>;
}

const IconCozPhone = React.forwardRef(IconCozPhoneComponent);
export default IconCozPhone;
