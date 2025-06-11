import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozFontHeightComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_font_height${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M4.29286 2.29289L4.27972 2.30628 1.46452 5.12147C1.074 5.51199 1.074 6.14516 1.46452 6.53568 1.85505 6.92621 2.48821 6.92621 2.87874 6.53568L4.00006 5.41436 4.00006 18.5839 2.87904 17.4629C2.48852 17.0724 1.85535 17.0724 1.46483 17.4629 1.0743 17.8534 1.0743 18.4866 1.46483 18.8771L4.27434 21.6866C4.28043 21.693 4.28662 21.6994 4.29292 21.7057 4.592 22.0048 5.03341 22.0748 5.39914 21.9158 5.41603 21.9084 5.43277 21.9006 5.44932 21.8923 5.54243 21.8455 5.62975 21.7832 5.70747 21.7055L5.71886 21.694 8.53556 18.8773C8.92608 18.4867 8.92608 17.8536 8.53556 17.463 8.14503 17.0725 7.51187 17.0725 7.12134 17.463L6.00006 18.5843 6.00006 5.41431 7.12129 6.53553C7.51181 6.92606 8.14497 6.92606 8.5355 6.53553 8.92602 6.14501 8.92602 5.51184 8.5355 5.12132L5.70707 2.29289C5.31655 1.90237 4.68338 1.90237 4.29286 2.29289zM12 3C11.4477 3 11 3.44772 11 4 11 4.55228 11.4477 5 12 5H22C22.5523 5 23 4.55228 23 4 23 3.44772 22.5523 3 22 3H12zM12 11C11.4477 11 11 11.4477 11 12 11 12.5523 11.4477 13 12 13H22C22.5523 13 23 12.5523 23 12 23 11.4477 22.5523 11 22 11H12zM11 20C11 19.4477 11.4477 19 12 19H22C22.5523 19 23 19.4477 23 20 23 20.5523 22.5523 21 22 21H12C11.4477 21 11 20.5523 11 20z"/></svg>;
}

const IconCozFontHeight = React.forwardRef(IconCozFontHeightComponent);
export default IconCozFontHeight;
