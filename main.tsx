import { createRoot } from "react-dom/client";
import { Autocomplete } from "./Autocomplete/Autocomplete";
import AutocompleteItems from "./Autocomplete/AutocompleteItems.json";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <div style={{ width: "500px", margin: "40px auto" }}>
      <Autocomplete
        items={AutocompleteItems}
        getLabel={(item) => item}
        onSelectionChange={(selected) =>
          console.log("Selection changed:", selected)
        }
        onCreateNew={(label) => label}
        placeholder="Search names..."
      />
    </div>,
  );
}
