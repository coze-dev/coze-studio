import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozDouyinCardComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_douyin_card${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M3 5H21V9.29576L21.1444 9.83457C21.2028 10.0526 21.3493 10.2436 21.5448 10.3564C21.7403 10.4693 21.9789 10.5007 22.1969 10.4423L23 10.2271V5C23 3.89543 22.1046 3 21 3H3C1.89543 3 1 3.89543 1 5V19C1 20.1046 1.89543 21 3 21H13.8838C13.6644 20.6226 13.4908 20.2103 13.3724 19.7684C13.3038 19.5123 13.2562 19.2556 13.2286 19H3L3 5Z"/><path d="M7 8C6.44772 8 6 8.44772 6 9 6 9.55228 6.44772 10 7 10H15C15.5523 10 16 9.55228 16 9 16 8.44772 15.5523 8 15 8H7zM6 14C6 13.4477 6.44772 13 7 13H13C13.5523 13 14 13.4477 14 14 14 14.5523 13.5523 15 13 15H7C6.44772 15 6 14.5523 6 14zM23.2715 13.801L23.1087 13.8446C22.5529 13.9936 21.9732 14.0315 21.4027 13.9564 21.1472 13.9228 20.8957 13.8668 20.6512 13.7893L21.6584 17.5482C22.1643 19.4362 21.0439 21.3768 19.1559 21.8827 17.2679 22.3886 15.3273 21.2682 14.8214 19.3802 14.3155 17.4922 15.436 15.5516 17.3239 15.0457 17.5466 14.986 17.7702 14.949 17.9921 14.9332L18.5397 16.977C18.3175 16.932 18.0817 16.9363 17.8474 16.9991 17.0382 17.2159 16.558 18.0476 16.7749 18.8568 16.9917 19.6659 17.8234 20.1461 18.6325 19.9293 19.4416 19.7125 19.9218 18.8808 19.705 18.0716L17.6986 10.5835 19.652 10.0601 19.6956 10.2228C19.7758 10.5221 19.9142 10.8027 20.1028 11.0485 20.2914 11.2943 20.5266 11.5006 20.7949 11.6555 21.0632 11.8104 21.3595 11.911 21.6666 11.9514 21.9738 11.9918 22.286 11.9714 22.5853 11.8912L22.748 11.8476 23.2715 13.801z"/></svg>;
}

const IconCozDouyinCard = React.forwardRef(IconCozDouyinCardComponent);
export default IconCozDouyinCard;
