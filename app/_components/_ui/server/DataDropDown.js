import StoreHydrator from "@/app/_store/StoreHydrator";
import { getData } from "@/app/_utils/helpers";
import { DropDown } from "../client/DropDown";

export default async function DataDropDown({ entity, ...params }) {
  const entityData = await getData(entity);

  return (
    <>
      <DropDown entity={entity} {...params} />

      <StoreHydrator entitiesData={{ [entity]: entityData }} />
    </>
  );
}
