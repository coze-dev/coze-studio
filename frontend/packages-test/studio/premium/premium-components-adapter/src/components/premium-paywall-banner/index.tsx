export { useFetchKnowledgeBenefit } from './use-fetch-knowledge-benefit';
export enum PremiumPaywallBannerScene {
  Knowledge, // 知识库场景
  Token, // 其余 Token 消耗场景
}

export function PremiumPaywallBanner(_props: {
  scene: PremiumPaywallBannerScene;
  knowledgeBenefit?: {
    total: number;
    used: number;
  };
  center?: boolean;
}) {
  return <></>;
}
