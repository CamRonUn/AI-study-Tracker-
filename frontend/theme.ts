export const colors = {
  background: '#FBFAFD',
  foreground: '#2A2238',
  muted: '#7A7390',
  card: '#FFFFFF',
  border: '#ECEAF2',
  secondary: '#F2EFF7',
  lavender: '#D9C8F0',
  lavenderSoft: '#EFE7F8',
  mint: '#C6ECD9',
  mintSoft: '#E4F5EC',
  sky: '#C7DDF2',
  skySoft: '#E5EFF8',
  peach: '#F5D8B6',
  peachSoft: '#FAEBD8',
};

export const radius = { sm: 12, md: 16, lg: 20, xl: 24, pill: 999 };

export const shadow = {
  shadowColor: '#5B4B7A',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.12,
  shadowRadius: 18,
  elevation: 6,
};

export const tone: Record<string, { bg: string; tag: string }> = {
  lavender: { bg: colors.lavenderSoft, tag: colors.lavender },
  mint: { bg: colors.mintSoft, tag: colors.mint },
  sky: { bg: colors.skySoft, tag: colors.sky },
  peach: { bg: colors.peachSoft, tag: colors.peach },
};
