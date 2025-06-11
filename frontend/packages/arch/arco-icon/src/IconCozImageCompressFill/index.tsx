import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozImageCompressFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_image_compress_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M9.10436 9.44427C9.96275 9.21427 10.4722 8.33194 10.2422 7.47355C10.0122 6.61515 9.12982 6.10574 8.27143 6.33575C7.41303 6.56575 6.90362 7.44808 7.13363 8.30647C7.36363 9.16487 8.24596 9.67428 9.10436 9.44427Z"/><path fillRule="evenodd" clipRule="evenodd" d="M3.33289 2.34377C2.24647 2.18369 1.36195 3.20692 1.6775 4.25877L3.13783 9.12654C3.70015 11.0009 3.70015 12.9991 3.13783 14.8735L1.66569 19.7806C1.35312 20.8225 2.21878 21.8403 3.29734 21.6989L9.04522 20.9457C11.0375 20.6846 13.0554 20.6857 15.0474 20.949L20.7 21.696C21.7791 21.8387 22.646 20.8205 22.3333 19.778L20.8619 14.8735C20.2996 12.9991 20.2996 11.0009 20.8619 9.12654L22.3213 4.26183C22.6371 3.20922 21.7511 2.18557 20.6641 2.3471L15.4129 3.12742C13.1808 3.4591 10.9121 3.46049 8.6796 3.13156L3.33289 2.34377ZM20.1795 4.44108L15.7068 5.1057C13.2807 5.46622 10.8147 5.46773 8.38807 5.1102L3.81903 4.43699L5.05349 8.55184C5.72827 10.8011 5.72827 13.1989 5.05349 15.4482L4.52671 17.2041L6.5062 15.5364C6.82795 15.2653 7.28495 15.2246 7.64954 15.4345L10.0974 16.8441C10.4667 17.0568 10.9303 17.012 11.2521 16.7325L14.7701 13.6772C15.1286 13.3659 15.6566 13.3496 16.0336 13.6381L19.1095 15.9922L18.9463 15.4482C18.2715 13.1989 18.2715 10.8011 18.9463 8.55184L20.1795 4.44108Z"/><path d="M23.1039 16.537C21.7983 13.6532 21.7983 10.3468 23.1039 7.46309L24.0001 5.48369V18.5164L23.1039 16.537zM.944395 7.46309C2.25001 10.3468 2.25001 13.6532.944394 16.537L.0482178 18.5164V5.48369L.944395 7.46309z"/></svg>;
}

const IconCozImageCompressFill = React.forwardRef(IconCozImageCompressFillComponent);
export default IconCozImageCompressFill;
