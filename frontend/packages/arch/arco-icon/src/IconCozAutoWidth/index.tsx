import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozAutoWidthComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_auto_width${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M1.30788 12.7931C1.30284 12.7883 1.29785 12.7834 1.29289 12.7785C0.908471 12.394 0.902464 11.7745 1.27487 11.3827C1.28078 11.3765 1.28679 11.3703 1.29289 11.3642C1.29284 11.3643 1.29294 11.3642 1.29289 11.3642C1.29339 11.3637 1.29404 11.3631 1.29454 11.3626L4.12132 8.53581C4.51184 8.14529 5.14501 8.14529 5.53553 8.53581C5.92606 8.92634 5.92606 9.5595 5.53553 9.95003L4.48535 11.0002L19.5132 11.0002L18.463 9.95003C18.0725 9.5595 18.0725 8.92634 18.463 8.53581C18.8535 8.14529 19.4867 8.14529 19.8772 8.53581L22.4467 11.1053C22.7747 11.2693 23 11.6085 23 12.0002C23 12.0192 22.9995 12.0381 22.9984 12.0569C23.0022 12.3176 22.9046 12.5795 22.7056 12.7785C22.6994 12.7847 22.693 12.7909 22.6866 12.797L19.8771 15.6065C19.4865 15.9971 18.8534 15.9971 18.4629 15.6065C18.0723 15.216 18.0723 14.5829 18.4629 14.1923L19.655 13.0002L4.34338 13.0002L5.53568 14.1925C5.92621 14.583 5.92621 15.2162 5.53568 15.6067C5.14516 15.9973 4.51199 15.9973 4.12147 15.6067L1.30788 12.7931Z"/></svg>;
}

const IconCozAutoWidth = React.forwardRef(IconCozAutoWidthComponent);
export default IconCozAutoWidth;
