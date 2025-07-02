import { type FC } from 'react';

import { useRequest } from 'ahooks';
import { I18n } from '@coze-arch/i18n';
import { IconCozIllusError } from '@coze-arch/coze-design/illustrations';
import { EmptyState } from '@coze-arch/coze-design';

import styles from './index.module.less';

export const PageList: FC<{
  title: string;
  renderCard: (cardData: unknown) => React.ReactNode;
  renderCardSkeleton: () => React.ReactNode;
  getDataList: () => Promise<unknown[]>;
}> = ({ title, renderCard, getDataList, renderCardSkeleton }) => {
  const {
    data: cardList,
    loading,
    error,
    refresh,
  } = useRequest(async () => {
    const dataList = await getDataList();
    return dataList;
  });
  console.log('data:', { cardList, loading, error });
  return (
    <div className={styles['explore-list-container']}>
      <h2 className="leading-[72px] text-[20px] m-[0] pl-[24px] pr-[24px]">
        {title}
      </h2>

      {error && !loading ? (
        <EmptyState
          size="full_screen"
          icon={<IconCozIllusError className="coz-fg-dim text-32px" />}
          title={I18n.t('inifinit_list_load_fail')}
          buttonText={I18n.t('inifinit_list_retry')}
          onButtonClick={() => {
            refresh();
          }}
        />
      ) : (
        <div className="grid grid-cols-3 auto-rows-min gap-[20px] [@media(min-width:1600px)]:grid-cols-4 pl-[24px] pr-[24px]">
          {loading
            ? new Array(20).fill(0).map((_, index) => renderCardSkeleton?.())
            : cardList?.map(item => renderCard(item))}
        </div>
      )}
    </div>
  );
};
