"use client";

import Button from "@/app/_ui/Button";
import ConfirmDelete from "@/app/_ui/ConfirmDelete";
import Modal from "@/app/_ui/Modal";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";

//* this is OK but not ideal because isOpenModal state is unnecessarily managed by the AddCabin component ...
// export default function AddItem() {
//   const [openModal, setOpenModal] = useState(false);

//   function handleOpenModal() {
//     setOpenModal(open => !open);
//   }

//   return (
//     <div>
//       <Button onClick={handleOpenModal}>
//         <div className="flex items-center justify-between gap-1">
//           <PlusIcon className="size-4" /> {'  '}
//           <span>Add item</span>
//         </div>
//       </Button>
//       {openModal && (
//         <Modal handleCloseModal={() => setOpenModal(false)}>
//           <p>This is Modal</p>
//           <Button type="cancel" onClick={() => setOpenModal(false)}>
//             Cancel
//           </Button>
//         </Modal>
//       )}
//     </div>
//   );
// }

//* applying the Compound Component Pattern to encapsulate the Modal Logic and state
export default function AddItem() {
  return (
    <div>
      <Modal>
        <Modal.Open opensWindowName="item-form">
          <Button>
            <div className="flex items-center justify-between gap-1">
              <PlusIcon className="size-4" />
              <span>Add item</span>
            </div>
          </Button>
        </Modal.Open>
        <Modal.Window name="item-form">
          This is a modal for the item form.
        </Modal.Window>

        <Modal.Open opensWindowName="confirm-delete">
          <Button>
            <div className="flex items-center justify-between gap-1">
              <MinusIcon className="size-4" />
              <span>Delete item</span>
            </div>
          </Button>
        </Modal.Open>
        <Modal.Window name="confirm-delete">
          <ConfirmDelete
            resourceName="item"
            onConfirm={() => {
              alert("delete confirmed");
            }}
          />
        </Modal.Window>
      </Modal>
    </div>
  );
}
