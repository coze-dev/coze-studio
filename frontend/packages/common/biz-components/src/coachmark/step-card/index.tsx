import { Container } from '../container';

import s from './index.module.less';

export const StepCard = (props: {
  content: string;
  title: string;
  imgSrc?: string;
}) => {
  const { imgSrc, content, title } = props;

  return (
    <>
      {imgSrc ? <img className={s.image} src={imgSrc} /> : null}

      <Container>
        <div className={s.title}>{title}</div>
        <div className={s.content}>{content}</div>
      </Container>
    </>
  );
};
