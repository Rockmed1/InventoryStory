export default function entityTransformers(entity) {
  const ENTITY_TRANSFORMERS = {
    item: {
      editForm: {
        apiOnlyData: (defaultValues) => {
          const {
            idField,
            itemClass: { idField: itemClassId },
            nameField,
            descField,
          } = defaultValues;
          return {
            idField,
            itemClassId,
            nameField,
            descField,
          };
        },

        restoreDefaultFormat: (transformedData, itemClassName) => {
          const { idField, itemClassId, nameField, descField } =
            transformedData;

          return {
            values: {
              idField,
              itemClass: {
                idField: itemClassId,
                nameField: itemClassName,
              },
              nameField,
              descField,
            },
          };
        },

        isChanged: (itemToEdit, dataObj) => {
          const { name, itemClassId, description } = itemToEdit;
          const { nameField, itemClassId: newItemClassId, descField } = dataObj;

          return (
            name !== nameField ||
            itemClassId !== newItemClassId ||
            description !== descField
          );
        },
      },
    },

    itemTrxDetails: {
      editForm: (defaultValues) => {
        // Transform logic for transaction details
      },
    },
  };

  const transformers = ENTITY_TRANSFORMERS[entity];

  if (!transformers) {
    throw new Error(`Transformers for entity "${entity}" not found.`);
  }
  return transformers;
}
