export function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function isValidTime(t: string) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(t);
  return Boolean(match);
}

