import Button from "./Button";

export default function ConfirmDelete({
  resourceName,
  onConfirm,
  disabled,
  onCloseModal,
}) {
  return (
    <div className="flex w-2xl flex-col gap-5">
      <h3 className="text-3xl font-medium">Delete {resourceName}</h3>
      <p className="">
        Are you sure you want to delete this {resourceName} permanently? This
        action cannot be undone.
      </p>
      <div>
        <Button onClick={onCloseModal} disabled={disabled} type="secondary">
          Cancel
        </Button>
        <Button onClick={onConfirm} disabled={disabled} type="danger">
          Delete
        </Button>
      </div>
    </div>
  );
}
