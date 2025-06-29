import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/_ui/Select";

export function SelectDemo() {
  return (
    <Select name="DemoSelect" onValueChange={(value) => console.log(value)}>
      <SelectTrigger className="w-m">
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent className="z-[2000]">
        <SelectItem value="light">Light</SelectItem>
        <SelectItem value="dark">Dark</SelectItem>
        <SelectItem value="system">System</SelectItem>
      </SelectContent>
    </Select>
  );
}
