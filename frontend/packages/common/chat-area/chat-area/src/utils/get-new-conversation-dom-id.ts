export function getNewConversationDomId(onboardingId?: string | null) {
  if (!onboardingId) {
    return '';
  }

  return `new-conversation-${onboardingId}`;
}
