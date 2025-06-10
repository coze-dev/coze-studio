import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozFireFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_fire_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M18.1159 8.40707C19.0236 9.24059 19.737 10.2326 20.2355 11.3525C20.7443 12.4954 21 13.7074 21 14.9551C21 16.1619 20.7622 17.3304 20.2917 18.4324C19.8391 19.4935 19.1898 20.4498 18.3614 21.2679C17.5355 22.0887 16.5715 22.7304 15.5002 23.1778C14.7265 23.5005 13.9204 23.7126 13.0915 23.8114C14.1822 23.4777 15.2727 22.2648 15.2727 20.6284C15.2727 17.9011 12.8015 18.2253 13.3469 14.9525C10.0742 15.498 6.49005 20.6284 10.9091 23.8114C10.08 23.7124 9.27369 23.4999 8.49972 23.1753C7.42841 22.7278 6.46704 22.0836 5.63863 21.2653C4.81278 20.4471 4.16336 19.4908 3.70824 18.4299C3.23778 17.3278 3 16.1593 3 14.9525C3 13.5872 3.3196 12.2244 3.92557 11.0074C4.52641 9.8031 5.41364 8.72667 6.49005 7.90082C6.93495 7.5582 7.34148 7.1619 7.70454 6.72213C8.22102 6.09315 8.625 5.39258 8.90625 4.63832C9.13636 4.02213 9.23352 3.28065 9.19516 2.44202L9.13892 1.21474C9.13125 1.05366 9.30767 0.946276 9.44574 1.0281L10.5017 1.6494C11.9489 2.50338 13.1071 3.72809 13.9406 5.29797C14.948 7.18746 15.4083 8.92355 15.3137 10.4628C15.3111 10.5088 15.329 10.5548 15.3648 10.5855C15.4032 10.6213 15.4465 10.6264 15.4747 10.6238C15.5028 10.6213 15.5438 10.611 15.5796 10.5727C16.119 9.97184 16.5 9.36077 16.7071 8.76246L17.0396 7.80878C17.088 7.6707 17.262 7.62725 17.372 7.7244L18.1159 8.40707Z"/></svg>;
}

const IconCozFireFill = React.forwardRef(IconCozFireFillComponent);
export default IconCozFireFill;
