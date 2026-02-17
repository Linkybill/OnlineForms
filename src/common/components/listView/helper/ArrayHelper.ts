/**
 * Remove defined item from defined array and return manipulated array
 * 
 * @param arr Array to remove item from
 * @param itemToBeRemoved Removing array item
 * @returns The manipulated array
 */
export function removeItemFromArray(
  arr: string[],
  itemToBeRemoved: string
): string[] {
  const index = arr.indexOf(itemToBeRemoved, 0);
  
  if (index > -1) {
    arr.splice(index, 1);
  }

  return arr;
}
