/**
 * Props for the generic Autocomplete component.
 *
 * @template T - The type of items in the autocomplete list.
 *
 * @example
 * // Simple string tags
 * <Autocomplete
 *   items={["Adam", "Bartek"]}
 *   getLabel={(item) => item}
 *   onCreateNew={(label) => label}
 * />
 *
 * @example
 * // Object-based items (e.g. addresses)
 * <Autocomplete<Address>
 *   items={addresses}
 *   getLabel={(addr) => `${addr.street}, ${addr.city}`}
 *   onSelectionChange={(selected) => setFormAddresses(selected)}
 * />
 */
export interface AutocompleteProps<T> {
  /** The list of available items to choose from. */
  items: T[];

  /** Returns the text label for a given item (used for display and filtering). */
  getLabel: (item: T) => string;

  /** Called whenever the selected items change. */
  onSelectionChange?: (selected: T[]) => void;

  /**
   * Called when the user creates a new item not found in the suggestions list.
   * Return the new item to add it, or `null` to reject it.
   * If not provided, creating new items is disabled.
   */
  onCreateNew?: (label: string) => T | null;

  /** Placeholder text for the input field. */
  placeholder?: string;

  /** Maximum number of items that can be selected. */
  maxSelected?: number;

  /** Maximum length of user input. Defaults to 200. */
  maxInputLength?: number;
}

/** Characters allowed in user-created tags: letters, digits, spaces, hyphens, apostrophes, dots. */
const ALLOWED_PATTERN = /^[\p{L}\p{N}\s\-'.]+$/u;

/**
 * Validates whether a label is safe to add to db.
 * Checks length limits and an allowlist of characters.
 */
export function isValidTag(label: string, maxLength = 200): boolean {
  if (!label || label.length === 0) return false;
  if (label.length > maxLength) return false;
  if (!ALLOWED_PATTERN.test(label)) return false;
  return true;
}
