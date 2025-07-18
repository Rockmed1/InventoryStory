import Button from "./_components/_ui/Button";

export default function Home() {
  return (
    <div className="mx-auto flex h-full items-center justify-between rounded-xl border border-neutral-200 bg-white px-2.5 py-1">
      <input
        type="checkbox"
        name="line"
        id="line"
        className="h-6 w-4 accent-blue-400 focus:ring focus:ring-blue-400 focus:ring-offset-2 focus:outline-none"
      />
      <h1 className="block text-xl font-semibold">Hello Inventory</h1>
      <input className="input w-36" value="Item Name" readOnly />
      <Button variant="secondary">Add Item</Button>
    </div>
  );
}
