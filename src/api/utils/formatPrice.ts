export function formatPrice(price: number): string {
  if (price || price === 0) {
    const replaceZero = price.toString().replace(".00", "");

    let formattedValue = replaceZero
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return formattedValue;
  } else {
    return "";
  }
}
