import SpinnerMini from "../_ui/SpinnerMini";

export default function loading() {
  return (
    <div className="grid items-center justify-center">
      <SpinnerMini />
      <p className="text-primary-900 text-md text-center">
        Loading Items data...
      </p>
    </div>
  );
}
