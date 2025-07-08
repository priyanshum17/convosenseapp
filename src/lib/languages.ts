export const languages = [
  { value: 'en-US', label: 'English' },
  { value: 'es-ES', label: 'Spanish' },
  { value: 'fr-FR', label: 'French' },
  { value: 'de-DE', label: 'German' },
  { value: 'ja-JP', label: 'Japanese' },
  { value: 'zh-CN', label: 'Chinese' },
  { value: 'ru-RU', label: 'Russian' },
  { value: 'ar-SA', label: 'Arabic' },
  { value: 'pt-BR', label: 'Portuguese' },
  { value: 'hi-IN', label: 'Hindi' },
];

export function getLanguageLabel(value: string) {
  return languages.find(lang => lang.value === value)?.label || 'Unknown';
}
