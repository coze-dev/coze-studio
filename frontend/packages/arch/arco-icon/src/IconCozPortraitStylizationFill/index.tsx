import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozPortraitStylizationFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_portrait_stylization_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M22.6329 3.43004C22.9945 3.55057 22.9945 4.06204 22.6329 4.18257L21.9901 4.39682C21.5164 4.55473 21.1446 4.92647 20.9867 5.4002L20.7725 6.04295C20.6519 6.40455 20.1405 6.40455 20.0199 6.04295L19.8057 5.4002C19.6478 4.92647 19.276 4.55473 18.8023 4.39682L18.1596 4.18257C17.798 4.06204 17.798 3.55057 18.1596 3.43004L18.8023 3.21579C19.276 3.05788 19.6478 2.68614 19.8057 2.2124L20.0199 1.56966C20.1405 1.20806 20.6519 1.20806 20.7725 1.56966L20.9867 2.21241C21.1446 2.68614 21.5164 3.05788 21.9901 3.21579L22.6329 3.43004zM5.65781 8.58109C5.90337 8.66294 5.90337 9.01028 5.65781 9.09213L5.22133 9.23763C4.89962 9.34486 4.64717 9.59731 4.53993 9.91902L4.39444 10.3555C4.31259 10.6011 3.96525 10.6011 3.88339 10.3555L3.7379 9.91902C3.63066 9.59731 3.37822 9.34486 3.05651 9.23763L2.62002 9.09213C2.37446 9.01028 2.37446 8.66294 2.62002 8.58109L3.05651 8.43559C3.37822 8.32835 3.63066 8.07591 3.7379 7.7542L3.88339 7.31772C3.96525 7.07215 4.31259 7.07215 4.39444 7.31772L4.53993 7.7542C4.64717 8.07591 4.89962 8.32836 5.22133 8.43559L5.65781 8.58109zM7.63269 6.17243C7.63269 8.5844 9.58798 10.5397 11.9999 10.5397 14.4119 10.5397 16.3672 8.5844 16.3672 6.17243 16.3672 3.76046 14.4119 1.80518 11.9999 1.80518 9.58798 1.80518 7.63269 3.76046 7.63269 6.17243zM9.37962 12.3641H14.6203C17.0323 12.3641 19.861 14.4637 19.861 18.2431V19.985C19.861 21.1825 19.0749 22.1624 18.1141 22.1624H5.88582C4.92502 22.1624 4.13892 21.1825 4.13892 19.985V18.2431C4.13892 14.4669 6.96765 12.3641 9.37962 12.3641z"/></svg>;
}

const IconCozPortraitStylizationFill = React.forwardRef(IconCozPortraitStylizationFillComponent);
export default IconCozPortraitStylizationFill;
