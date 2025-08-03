import StoreHydrator from "@/app/_store/StoreHydrator";
import { getServerData } from "@/app/_utils/helpers";
import { DropDown } from "../client/DropDown";

export default async function DataDropDown({ entity, ...params }) {
  const entityData = await getServerData(entity);

  return (
    <>
      <DropDown entity={entity} {...params} />

      <StoreHydrator entitiesData={{ [entity]: entityData }} />
    </>
  );
}
