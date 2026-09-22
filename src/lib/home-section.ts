// Keep a failed homepage query from discarding other sections' successful data.
export async function loadHomeSection<T>(name: string, load: () => Promise<T>, fallback: T): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await load();
    } catch (error) {
      if (attempt === 2) {
        console.error(`Unable to load homepage ${name}`, error);
        return fallback;
      }
      await new Promise(resolve => setTimeout(resolve, 400 * (attempt + 1)));
    }
  }
  return fallback;
}
