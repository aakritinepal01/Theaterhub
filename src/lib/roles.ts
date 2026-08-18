type Credit<T> = { role: string; profile: T };

export function groupRoles<T>(credits: Credit<T>[]) {
  const groups = new Map<string, T[]>();
  for (const credit of credits) groups.set(credit.role, [...(groups.get(credit.role) ?? []), credit.profile]);
  return [...groups].map(([role, profiles]) => ({ role, profiles }));
}

export function groupCreditsByPlay<T extends { id: number }>(credits: { role: string; play: T }[]) {
  const groups = new Map<number, { play: T; roles: string[] }>();
  for (const credit of credits) {
    const item = groups.get(credit.play.id) ?? { play: credit.play, roles: [] };
    item.roles.push(credit.role);
    groups.set(credit.play.id, item);
  }
  return [...groups.values()];
}
