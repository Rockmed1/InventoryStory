import { useCurrentQoh } from "@/app/_utils/helpers-client";
import { useWatch } from "react-hook-form";

export default function LineQohDisplay({ control, index }) {
  const line = useWatch({
    control,
    name: `itemTrxDetails[${index}]`,
  });

  const trigger = line?.itemId && line.fromBinId;
  const qoh = useCurrentQoh({
    itemId: line?.itemId,
    binId: line?.fromBinId,
  });

  return (
    <div className="flex w-full items-center justify-between">
      <span className="block">Qty Out</span>
      {trigger && (
        <span key={line?.itemId} className={"block text-sm font-light italic"}>
          Available:{" "}
          <span className={`${qoh === 0 ? "text-red-500" : "text-green-700"}`}>
            {qoh}
          </span>
        </span>
      )}
    </div>
  );
}
