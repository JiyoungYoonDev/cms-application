import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ADD_VALUE = '__add_new__';

export function Dropdown({
  data = [],
  value,
  onChange,
  placeholder,
  label = 'Options',
  valueKey = 'value',
  labelKey = 'label',
  add = false,
  className = '',
  onAddClick,
}) {
  const handleValueChange = (selectedValue) => {
    if (selectedValue === ADD_VALUE) {
      onAddClick?.();
      return;
    }

    onChange?.(selectedValue);
  };

  return (
    <Select value={value} onValueChange={handleValueChange}>
      <SelectTrigger className={`w-full max-w-48 ${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent>
        <SelectGroup>
          <SelectLabel>{label}</SelectLabel>
          {data.map((item) => (
            <SelectItem
              key={item.id ?? item[valueKey]}
              value={String(item?.[valueKey] ?? item?.category_name)}
            >
              {item?.[labelKey] ?? item?.category_name}
            </SelectItem>
          ))}
        </SelectGroup>

        {add && (
          <>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Add New</SelectLabel>
              <SelectItem value={ADD_VALUE}>Add +</SelectItem>
            </SelectGroup>
          </>
        )}
      </SelectContent>
    </Select>
  );
}
