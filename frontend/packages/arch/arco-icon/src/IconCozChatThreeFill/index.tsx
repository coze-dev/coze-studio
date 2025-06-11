import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozChatThreeFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_chat_three_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M7 2.5C5.89543 2.5 5 3.39543 5 4.5V5.5C5 6.60457 5.89543 7.5 7 7.5H18.6667L21.3046 9.08276C21.5434 9.22605 21.8316 8.99487 21.7435 8.73064L21.3246 7.47379C22.2748 7.31871 23 6.49405 23 5.5V4.5C23 3.39543 22.1046 2.5 21 2.5H7zM5 17.5C5 16.3954 5.89543 15.5 7 15.5H21C22.1046 15.5 23 16.3954 23 17.5V18.5C23 19.494 22.2748 20.3187 21.3246 20.4738L21.7435 21.7306C21.8316 21.9949 21.5434 22.2261 21.3046 22.0828L18.6667 20.5H7C5.89543 20.5 5 19.6046 5 18.5V17.5zM1 11C1 9.89543 1.89543 9 3 9H17C18.1046 9 19 9.89543 19 11V12C19 13.1046 18.1046 14 17 14H5.33333L2.69541 15.5828C2.45658 15.7261 2.16838 15.4949 2.25645 15.2306L2.6754 13.9738C1.7252 13.8187 1 12.994 1 12V11z"/></svg>;
}

const IconCozChatThreeFill = React.forwardRef(IconCozChatThreeFillComponent);
export default IconCozChatThreeFill;
