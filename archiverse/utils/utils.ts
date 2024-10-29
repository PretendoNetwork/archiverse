export function numberWithCommas(x: number) {
  if (!x) {
    return 0;
  }
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function extractEnglishCharacters(input: string): string {
  // Use a regular expression to replace all characters that are not alphanumeric, spaces, underscores, hyphens, or periods with an empty string
  let sanitizedInput = input.replace(/[^a-zA-Z0-9 _.-]/g, '');
  return sanitizedInput;
}

