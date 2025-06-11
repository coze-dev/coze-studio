import { Skeleton } from '@coze/coze-design';
export const RecommendCardLoading = () => (
  <div className="flex flex-col flex-shrink-0 flex-nowrap px-3 py-2 aspect-[180/120] rounded-lg border coz-stroke-primary coz-bg-max">
    <Skeleton
      placeholder={<Skeleton.Title />}
      className="mb-3 w-2/3"
    ></Skeleton>
    <Skeleton
      placeholder={<Skeleton.Paragraph rows={3} />}
      className="w-full"
    ></Skeleton>
  </div>
);
