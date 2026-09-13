export const reminderDefinitions = [
  { type: 'posture', intervalMs: 30 * 60 * 1000, priority: 1, icon: '\u{1F504}', variants: [
    { title: 'Time to switch!', message: "Sitting? Up you go! Standing? Take a seat." },
    { title: 'Posture swap!', message: 'Switch between sitting and standing. Give your body a change of scenery.' },
    { title: 'Switch it up!', message: 'Standing becomes sitting. Sitting becomes standing.' },
  ] },
  { type: 'stretch', intervalMs: 60 * 60 * 1000, priority: 2, icon: '\u{1F646}', variants: [
    { title: 'Stretch break!', message: 'Loosen up your shoulders and give your back and arms a stretch.' },
    { title: 'Quick reset!', message: 'Take a minute to stretch your neck, shoulders, back, and arms.' },
    { title: 'Uncrunch yourself!', message: 'Neck, shoulders, back, arms. Give them a little movement.' },
  ] },
];
export const combinedReminder = { type: 'movement', icon: '\u{1F646}', variants: [
  { title: 'Time to move!', message: 'Switch between sitting and standing, then take a minute to stretch.' },
  { title: 'Switch and stretch!', message: 'Swap your posture and loosen up your neck, shoulders, back, and arms.' },
  { title: 'A little movement!', message: 'Stand or sit, then give your body a quick stretch.' },
] };

// Timing knows only intervals and priorities; content is selected separately.
export function advanceReminders(elapsedMs, deltaMs, remainingSecs, definitions = reminderDefinitions) {
  const next = elapsedMs + Math.max(0, deltaMs);
  const due = remainingSecs > 0 ? definitions.filter(definition =>
    Math.floor(next / definition.intervalMs) > Math.floor(elapsedMs / definition.intervalMs)
  ).sort((a, b) => b.priority - a.priority).map(definition => definition.type) : [];
  return { elapsedMs: next, due };
}

export function getReminderContent(types, rotations, definitions = reminderDefinitions) {
  if (!types.length) return null;
  const definition = types.includes('posture') && types.includes('stretch')
    ? combinedReminder : definitions.find(definition => definition.type === types[0]);
  if (!definition) return null;
  const index = rotations[definition.type] ?? 0;
  rotations[definition.type] = index + 1;
  return { kind: definition.type, icon: definition.icon, ...definition.variants[index % definition.variants.length] };
}
