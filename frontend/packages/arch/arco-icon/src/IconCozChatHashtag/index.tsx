import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozChatHashtagComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_chat_hashtag${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M9.92811 8.10533L9.7048 9.51526H8.46199C8.09307 9.51526 7.77893 9.78355 7.72122 10.1479C7.6491 10.6033 8.00098 11.0153 8.46199 11.0153H9.46723L9.15046 13.0153H7.90764C7.53872 13.0153 7.22459 13.2836 7.16687 13.6479C7.09476 14.1033 7.44663 14.5153 7.90764 14.5153H8.91288L8.73159 15.6599C8.65947 16.1152 9.01135 16.5272 9.47235 16.5272C9.84127 16.5272 10.1554 16.2589 10.2131 15.8945L10.4316 14.5153H12.7822L12.6009 15.6599C12.5288 16.1152 12.8806 16.5272 13.3416 16.5272C13.7106 16.5272 14.0247 16.2589 14.0824 15.8945L14.3009 14.5153H15.5379C15.9068 14.5153 16.221 14.247 16.2787 13.8826C16.3508 13.4273 15.9989 13.0153 15.5379 13.0153H14.5384L14.8552 11.0153H16.0922C16.4612 11.0153 16.7753 10.747 16.833 10.3826C16.9051 9.92725 16.5533 9.51526 16.0922 9.51526H15.0928L15.2789 8.33998C15.3511 7.88465 14.9992 7.47266 14.5382 7.47266C14.1693 7.47266 13.8551 7.74095 13.7974 8.10533L13.5741 9.51526H11.2235L11.4096 8.33998C11.4818 7.88465 11.1299 7.47266 10.6689 7.47266C10.3 7.47266 9.98583 7.74095 9.92811 8.10533ZM13.3365 11.0153L13.0197 13.0153H10.6692L10.9859 11.0153H13.3365Z"/><path fillRule="evenodd" clipRule="evenodd" d="M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 15.1688 2.3399 18.0247 4.48405 20.0319L3.72361 21.5528C3.39116 22.2177 3.87465 23 4.61803 23H12ZM6.94025 19.5916L5.85088 18.5718C4.09379 16.9269 3 14.5928 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21H6.23607L6.94025 19.5916Z"/></svg>;
}

const IconCozChatHashtag = React.forwardRef(IconCozChatHashtagComponent);
export default IconCozChatHashtag;
