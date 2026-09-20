// Plain-text cookbook export — no photography anywhere in this app, so
// there are no images to bundle in; this is the whole export.

import type { Recipe } from '@/lib/types';

function formatRecipe(recipe: Recipe): string {
  const lines: string[] = [];
  lines.push(recipe.title);
  lines.push('='.repeat(recipe.title.length));
  if (recipe.subtitle) lines.push(recipe.subtitle);
  lines.push('');
  lines.push(`${recipe.time} · serves ${recipe.serves} · ${recipe.difficulty}`);
  if (recipe.tags.length > 0) lines.push(recipe.tags.map((t) => `#${t}`).join(' '));
  if (recipe.intro) {
    lines.push('');
    lines.push(recipe.intro);
  }

  lines.push('');
  lines.push('INGREDIENTS');
  for (const section of recipe.ingredients) {
    if (section.section) lines.push(`-- ${section.section} --`);
    for (const item of section.items) lines.push(`  ${item.q ? `${item.q} ` : ''}${item.i}`);
  }

  lines.push('');
  lines.push('METHOD');
  recipe.steps.forEach((step, i) => {
    lines.push(`${i + 1}. ${step.t}`);
    if (step.d) lines.push(`   ${step.d}`);
    if (step.timer) lines.push(`   (${step.timer} min)`);
  });

  if (recipe.notes.length > 0) {
    lines.push('');
    lines.push('NOTES');
    for (const note of recipe.notes) lines.push(`- ${note.text}`);
  }

  return lines.join('\n');
}

export function formatCookbookExport(name: string, recipes: Recipe[]): string {
  const header = [`${name}'s cookbook`, `Exported from Special Spoon · ${recipes.length} recipes`, ''].join('\n');
  const body = recipes.map(formatRecipe).join('\n\n\n');
  return `${header}\n${body}\n`;
}

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
