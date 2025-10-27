export const formatDate = (value: string) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(value));
  } catch (error) {
    console.error('Failed to format date', error);
    return value;
  }
};

export const truncateAddress = (address?: string | null, chars = 4) => {
  if (!address) {
    return '';
  }
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
};
