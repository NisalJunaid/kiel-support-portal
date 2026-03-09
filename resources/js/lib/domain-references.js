const badgeVariantMap = {
  success: 'success',
  warning: 'warning',
  destructive: 'destructive',
  info: 'info',
  secondary: 'secondary',
};

export function getDomainOptions(domainReferences, key) {
  return domainReferences?.[key]?.options ?? [];
}

export function getDomainLabel(domainReferences, key, value) {
  const option = getDomainOptions(domainReferences, key).find((entry) => entry.value === value);

  return option?.label ?? value;
}

export function getDomainBadgeVariant(domainReferences, key, value) {
  const option = getDomainOptions(domainReferences, key).find((entry) => entry.value === value);

  return badgeVariantMap[option?.badgeVariant] ?? 'secondary';
}
