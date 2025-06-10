import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozMoveToTopFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_move_to_top_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 25 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M13.2568 0.833782L21.9574 6.55315C22.6221 6.9903 22.8232 7.90663 22.405 8.60439C22.2925 8.79214 22.1397 8.95186 21.9574 9.07236L13.2675 14.7777C12.8038 15.0804 12.2168 15.0804 11.7558 14.7777L3.05253 9.05555C2.38779 8.6184 2.18676 7.70207 2.60491 7.00431C2.71748 6.81656 2.87027 6.65683 3.05253 6.53634L11.7478 0.828178C12.2115 0.525536 12.7985 0.525536 13.2595 0.828178L13.2568 0.833782Z"/><path d="M2.73197 11.2241C2.68533 11.2805 2.64283 11.3406 2.60491 11.4039C2.18676 12.1016 2.38779 13.0179 3.05253 13.4551L11.7558 19.1773C12.2168 19.4799 12.8038 19.4799 13.2675 19.1773L21.9574 13.4719C22.1397 13.3514 22.2925 13.1917 22.405 13.0039C22.7452 12.4362 22.6756 11.7238 22.2798 11.2426L13.5105 17.0001C12.8991 17.3991 12.125 17.3991 11.5171 17.0001L2.73197 11.2241Z"/><path d="M2.60515 15.4937C2.64308 15.4304 2.68557 15.3704 2.73222 15.3139L11.5173 21.0899C12.1253 21.489 12.8993 21.489 13.5108 21.0899L22.28 15.3324C22.6758 15.8137 22.7455 16.5261 22.4053 17.0938C22.2927 17.2815 22.1399 17.4412 21.9576 17.5617L13.2678 23.2671C12.8041 23.5697 12.2171 23.5697 11.756 23.2671L3.05278 17.5449C2.38804 17.1078 2.18701 16.1915 2.60515 15.4937Z"/></svg>;
}

const IconCozMoveToTopFill = React.forwardRef(IconCozMoveToTopFillComponent);
export default IconCozMoveToTopFill;
