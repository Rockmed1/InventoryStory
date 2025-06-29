import SpinnerMini from "../_components/_ui/SpinnerMini";

export default function loading() {
  return (
    <div className="grid items-center justify-center">
      <SpinnerMini />
      <p className="text-md text-center text-neutral-900">
        Loading Items data...
      </p>
    </div>
  );
}
