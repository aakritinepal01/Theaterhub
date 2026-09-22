type Credit<T> = { role: string; profile: T };

export function groupPlaysByRole<T extends { id?: number; title: string; slug: string | null }>(items: { play: T; roles: string[] }[]) {
  const groups = new Map<string, { role: string; plays: Map<string | number, T> }>();
  for (const item of items) {
    for (const value of item.roles.flatMap(role => role.split(/[,\n]+/))) {
      const role = value.trim().replace(/\s+/g, " ");
      if (!role) continue;
      const key = role.toLocaleLowerCase().replace(/\s+/g, "");
      const group = groups.get(key) ?? { role, plays: new Map<string | number, T>() };
      group.plays.set(item.play.id ?? item.play.slug ?? item.play.title, item.play);
      groups.set(key, group);
    }
  }
  return [...groups.values()].map(group => ({ role: group.role, plays: [...group.plays.values()] }));
}

export function groupRoles<T>(credits: Credit<T>[]) {
  const groups = new Map<string, T[]>();
  for (const credit of credits) groups.set(credit.role, [...(groups.get(credit.role) ?? []), credit.profile]);
  return [...groups].map(([role, profiles]) => ({ role, profiles })).sort((a, b) => a.role.localeCompare(b.role));
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
