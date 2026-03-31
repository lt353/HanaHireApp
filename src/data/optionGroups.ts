/** Labeled buckets for long picklists (UI section headers or HTML optgroup). */
export type LabeledStringGroup = {
  label: string;
  items: readonly string[];
};

export function flattenLabeledGroups(groups: readonly LabeledStringGroup[]): string[] {
  return groups.flatMap((g) => [...g.items]);
}
