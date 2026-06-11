import React, { useEffect, useMemo, useRef, useState } from "react";
import type { AutocompleteProps } from "./types";
import { isValidTag } from "./types";

export function Autocomplete<T>({
  items,
  getLabel,
  onSelectionChange,
  onCreateNew,
  placeholder = "",
  maxSelected,
  maxInputLength = 200,
}: AutocompleteProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isKeyboardAction = useRef(false);

  const [inputValue, setInputValue] = useState("");
  const [tags, setTags] = useState<T[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showList, setShowList] = useState(false);

  const { filteredItems, typeaheadHint } = useMemo(() => {
    if (!inputValue) {
      return { filteredItems: items, typeaheadHint: "" };
    }

    const lowerInput = inputValue.toLowerCase();

    const startsWith = items.filter((item) =>
      getLabel(item).toLowerCase().startsWith(lowerInput),
    );

    const includes = items.filter(
      (item) =>
        getLabel(item).toLowerCase().includes(lowerInput) &&
        !getLabel(item).toLowerCase().startsWith(lowerInput),
    );

    const typeaheadHint = startsWith[0]
      ? inputValue + getLabel(startsWith[0]).slice(inputValue.length)
      : "";

    return {
      filteredItems: [...startsWith, ...includes],
      typeaheadHint: typeaheadHint,
    };
  }, [inputValue, items, getLabel]);

  useEffect(() => {
    if (!isKeyboardAction.current) return;
    const activeItem = document.getElementById(`item-${activeIndex}`);
    activeItem?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const updateTags = (nextTags: T[]) => {
    setTags(nextTags);
    onSelectionChange?.(nextTags);
  };

  const addTag = (item: T) => {
    const label = getLabel(item);

    if (!isValidTag(label, maxInputLength)) {
      inputRef.current?.focus();
      return;
    }

    if (maxSelected && tags.length >= maxSelected) {
      inputRef.current?.focus();
      return;
    }

    const isDuplicate = tags.some(
      (existing) => getLabel(existing).toLowerCase() === label.toLowerCase(),
    );
    if (isDuplicate) {
      inputRef.current?.focus();
      return;
    }

    updateTags([...tags, item]);
    setInputValue("");
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (
        activeIndex >= 0 &&
        activeIndex < filteredItems.length &&
        isKeyboardAction.current
      ) {
        addTag(filteredItems[activeIndex]);
      } else if (inputValue.trim().length > 0 && onCreateNew) {
        const newItem = onCreateNew(inputValue.trim());
        if (newItem !== null) addTag(newItem);
      }
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      isKeyboardAction.current = true;
      setActiveIndex((prev) => Math.min(prev + 1, filteredItems.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      isKeyboardAction.current = true;
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    }
    if (
      (e.key === "ArrowRight" || e.key === "Tab") &&
      typeaheadHint &&
      typeaheadHint !== inputValue
    ) {
      e.preventDefault();
      setInputValue(typeaheadHint);
      return;
    }
    if (e.key === "Backspace" && !inputValue) {
      updateTags(tags.slice(0, -1));
    }
    if (e.key === "Escape") {
      setShowList(false);
      inputRef.current?.blur();
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const nextFocusTarget = e.relatedTarget as HTMLElement | null;
    if (containerRef.current?.contains(nextFocusTarget)) return;
    setShowList(false);
  };

  return (
    <div
      ref={containerRef}
      onBlur={handleBlur}
      onFocus={() => setShowList(true)}
      className="autocomplete"
    >
      <ul
        className="tagBox"
        onClick={() => inputRef.current?.focus()}
        aria-label="Selected tags"
      >
        {tags.map((tag) => {
          const label = getLabel(tag);
          return (
            <li tabIndex={-1} className="tag" key={label}>
              <span className="tag-text">{label}</span>
              <button
                aria-label={`Remove ${label}`}
                type="button"
                onClick={() =>
                  updateTags(
                    tags.filter(
                      (t) => getLabel(t).toLowerCase() !== label.toLowerCase(),
                    ),
                  )
                }
              >
                &times;
              </button>
            </li>
          );
        })}
        <li className="inputWrapper">
          <input
            className="typeahead"
            value={typeaheadHint}
            disabled
            tabIndex={-1}
            aria-hidden="true"
          />
          <input
            role="combobox"
            name="autocomplete"
            autoComplete="off"
            maxLength={maxInputLength}
            aria-autocomplete="list"
            aria-expanded={showList}
            aria-activedescendant={
              activeIndex >= 0 ? `item-${activeIndex}` : undefined
            }
            aria-label="Autocomplete input"
            aria-controls="autocomplete-list"
            placeholder={placeholder}
            value={inputValue}
            className="autocompleteInput"
            onChange={(e) => {
              setInputValue(e.target.value);
              setActiveIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            ref={inputRef}
          />
        </li>
      </ul>
      {showList && (
        <ul
          className="autocomplete-list"
          id="autocomplete-list"
          role="listbox"
          tabIndex={-1}
          onMouseMove={() => {
            isKeyboardAction.current = false;
          }}
        >
          {filteredItems.map((item, i) => {
            const label = getLabel(item);
            return (
              <li
                id={`item-${i}`}
                tabIndex={-1}
                role="option"
                aria-selected={i === activeIndex}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => addTag(item)}
                className={i === activeIndex ? "active" : ""}
                key={label}
              >
                {label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
