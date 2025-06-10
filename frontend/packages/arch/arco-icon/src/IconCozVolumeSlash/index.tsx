import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozVolumeSlashComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_volume_slash${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 25 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M2.42644 1.7033C2.81696 1.31277 3.45012 1.31277 3.84065 1.70329L22.9318 20.7943C23.3223 21.1848 23.3223 21.818 22.9318 22.2085 22.5413 22.5991 21.9081 22.5991 21.5176 22.2085L2.42644 3.11751C2.03591 2.72699 2.03591 2.09382 2.42644 1.7033zM2.62329 7H3.48052L3.62329 7.14277V17H2.62329C2.07101 17 1.62329 16.5523 1.62329 16V8C1.62329 7.44772 2.07101 7 2.62329 7zM5.62329 16.9999V9.14276L7.62329 11.1427V15.9773L12.6233 19.5884V16.1427L14.6233 18.1427V20.5663C14.6233 21.79 13.237 22.4988 12.2451 21.7823L5.62329 16.9999zM12.6233 4.41145V7.65746L14.6233 9.65745V3.43357C14.6233 2.20992 13.237 1.50111 12.2451 2.21755L9.30601 4.3402 10.7385 5.77268 12.6233 4.41145zM17.6686 12.7028L19.2473 14.2815C19.5568 13.6034 19.7344 12.8515 19.7344 12 19.7344 10.5413 19.213 9.37484 18.4007 8.37099 18.0533 7.94166 17.4236 7.87525 16.9943 8.22266 16.5649 8.57008 16.4985 9.19975 16.846 9.62908 17.4234 10.3427 17.7344 11.0773 17.7344 12 17.7344 12.2467 17.7122 12.4798 17.6686 12.7028zM20.7003 15.7344L22.1663 17.2004C23.0903 15.6853 23.6233 13.9047 23.6233 12.0001 23.6233 9.03832 22.3344 6.37626 20.2902 4.54662 19.8787 4.1783 19.2465 4.21332 18.8782 4.62484 18.5098 5.03637 18.5449 5.66857 18.9564 6.03689 20.5947 7.50318 21.6233 9.63084 21.6233 12.0001 21.6233 13.349 21.2899 14.6196 20.7003 15.7344z"/></svg>;
}

const IconCozVolumeSlash = React.forwardRef(IconCozVolumeSlashComponent);
export default IconCozVolumeSlash;
