import Button from "./Button";

/**
 * A confirmation dialog for destructive actions.
 *
 * @param {string} resourceName - The name of the resource to be deleted (e.g., "item", "location").
 * @param {Function} onConfirm - The function to call when the delete button is clicked.
 * @param {boolean} disabled - Whether the buttons should be disabled.
 * @param {Function} [onCloseModal] - An optional function to close the modal this component is in.
 */
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
        <Button onClick={onCloseModal} disabled={disabled} variant="secondary">
          Cancel
        </Button>
        <Button onClick={onConfirm} disabled={disabled} variant="danger">
          Delete
        </Button>
      </div>
    </div>
  );
}
