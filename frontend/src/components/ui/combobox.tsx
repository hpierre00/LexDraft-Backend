"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ComboboxProps<T> {
  options: { value: string; label: string; data?: T }[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
}

export function Combobox<T>({
  options,
  value,
  onValueChange,
  placeholder = "Select an option...",
  emptyMessage = "No item found.",
  disabled = false,
}: ComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  React.useEffect(() => {
    console.log("Combobox open state changed to:", open);
  }, [open]);

  const filteredOptions = React.useMemo(() => {
    if (!searchValue) {
      return options;
    }
    const lowerCaseSearchValue = searchValue.toLowerCase();
    return options.filter((option) =>
      option.label.toLowerCase().includes(lowerCaseSearchValue)
    );
  }, [options, searchValue]);

  return (
    <Popover
      open={open}
      onOpenChange={(newOpen) => {
        console.log("onOpenChange called with:", newOpen);
        setOpen(newOpen);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {value
            ? options.find((option) => option.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder={placeholder}
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-y-auto">
            {filteredOptions.map((option) => (
              <CommandItem
                key={option.value}
                value={option.label} // Use label for command search
                onSelect={() => {
                  onValueChange(option.value);
                  console.log("onSelect called, setting open to false.");
                  setOpen(false);
                  setSearchValue(""); // Clear search on select
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === option.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
