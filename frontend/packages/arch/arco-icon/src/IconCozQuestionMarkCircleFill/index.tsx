import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozQuestionMarkCircleFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_question_mark_circle_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23ZM13.0678 8.54957C12.8348 8.31766 12.4938 8.19567 12.0297 8.19567C11.4238 8.19567 11.0396 8.37238 10.8074 8.71466L10.8032 8.72076C10.6967 8.86487 10.6145 9.0447 10.5589 9.26332C10.4326 9.75923 10.0296 10.2267 9.45808 10.2267C8.90924 10.2267 8.40983 9.77103 8.51382 9.18313C8.64266 8.45471 8.94881 7.84713 9.4481 7.37022C10.1177 6.71658 11.0147 6.39844 12.132 6.39844C13.1137 6.39844 13.9356 6.65572 14.5619 7.21888C15.1914 7.7702 15.5 8.5247 15.5 9.45958C15.5 10.2228 15.3011 10.8621 14.9228 11.3664L14.9179 11.3729L14.9125 11.379C14.7722 11.5349 14.3393 11.9371 13.6404 12.5486L13.6371 12.5515C13.3935 12.7544 13.2193 12.9828 13.099 13.2234C13.0745 13.2723 13.0529 13.3225 13.0339 13.3739C12.8668 13.8257 12.4841 14.2934 11.9213 14.2934C11.3582 14.2934 10.828 13.8235 10.9502 13.2136C10.9957 12.9868 11.0645 12.7724 11.165 12.5778C11.2724 12.3558 11.4772 12.0884 11.764 11.7777C12.0526 11.465 12.4343 11.0981 12.9072 10.6757L13.0732 10.482C13.3119 10.1897 13.4251 9.87955 13.4251 9.56186C13.4251 9.11968 13.2926 8.78784 13.0678 8.54957ZM12.8164 15.3895C13.0548 15.6279 13.1914 15.9372 13.1914 16.3077C13.1914 16.6762 13.056 17.0034 12.7973 17.2449C12.5425 17.4826 12.2343 17.6008 11.869 17.6008C11.4976 17.6008 11.1909 17.4637 10.9407 17.2302C10.6795 16.9864 10.5613 16.6724 10.5613 16.3077C10.5613 15.943 10.6795 15.629 10.9407 15.3851C11.1955 15.1474 11.5037 15.0292 11.869 15.0292C12.2319 15.0292 12.5555 15.1458 12.8119 15.3851L12.8164 15.3895Z"/></svg>;
}

const IconCozQuestionMarkCircleFill = React.forwardRef(IconCozQuestionMarkCircleFillComponent);
export default IconCozQuestionMarkCircleFill;
