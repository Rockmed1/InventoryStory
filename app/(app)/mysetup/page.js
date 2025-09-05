import { Button } from "@/app/_components/_ui/client/shadcn/shadcn-Button";
import {
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/_components/_ui/client/shadcn/shadcn-Collapsible";
import { Collapsible } from "@radix-ui/react-collapsible";
import { ChevronsUpDownIcon } from "lucide-react";
import { Suspense } from "react";
import AddButtonModal from "../../_components/_ui/client/AddButtonModal";
import Card from "../../_components/_ui/server/Card";
import AddBinForm from "../../_components/client/AddBinForm";
import AddItemClassForm from "../../_components/client/AddItemClassForm";
import AddLocationForm from "../../_components/client/AddLocationForm";
import AddMarketForm from "../../_components/client/AddMarketForm";
import AddMarketTypeForm from "../../_components/client/AddMarketTypeForm";
import AddTrxTypeForm from "../../_components/client/AddTrxTypeForm";
import BinsTable from "../../_components/server/BinsTable";
import ItemClassesTable from "../../_components/server/ItemClassesTable";
import LocationsTable from "../../_components/server/locationsTable";
import MarketsTable from "../../_components/server/MarketsTable";
import MarketTypesTable from "../../_components/server/MarketTypesTable";
import TrxTypesTable from "../../_components/server/TrxTypesTable";
import getAuthContext from "../../_lib/auth/getAuthContext";

export const revalidate = 0; // this will make the page dynamic and revalidate cache every request

export default function Page() {
  //1- authenticate the user
  const { _org_uuid, _usr_uuid } = getAuthContext();

  const cards = [
    {
      cardName: "Locations",
      cardTable: <LocationsTable />,
      cardFallback: <LocationsTable.Fallback />,
      CardAction: (
        <AddButtonModal
          opensWindowName="add-locations"
          buttonLabel="Add Location"
          title="Add Location"
          description="Create a new location.">
          <AddLocationForm />
        </AddButtonModal>
      ),
    },

    {
      cardName: "Bins",
      cardTable: <BinsTable />,
      cardFallback: <BinsTable.Fallback />,
      CardAction: (
        <AddButtonModal
          opensWindowName="add-Bins"
          buttonLabel="Add Bin"
          title="Add Bin"
          description="Create a new bin.">
          <AddBinForm />
        </AddButtonModal>
      ),
    },

    {
      cardName: "Item Classes",
      cardTable: <ItemClassesTable />,
      cardFallback: <ItemClassesTable.Fallback />,
      CardAction: (
        <AddButtonModal
          opensWindowName="add-Item-Classes"
          buttonLabel="Add Item Class">
          <AddItemClassForm />
        </AddButtonModal>
      ),
    },

    {
      cardName: "Transaction Types",
      cardTable: <TrxTypesTable />,
      cardFallback: <TrxTypesTable.Fallback />,
      CardAction: (
        <AddButtonModal
          opensWindowName="add-Transaction-Types"
          buttonLabel="Add Trx Type">
          <AddTrxTypeForm />
        </AddButtonModal>
      ),
    },

    {
      cardName: "Market Types",
      cardTable: <MarketTypesTable />,
      cardFallback: <MarketTypesTable.Fallback />,
      CardAction: (
        <AddButtonModal
          opensWindowName="add-Market-Types"
          buttonLabel="Add Market Type">
          <AddMarketTypeForm />
        </AddButtonModal>
      ),
    },

    {
      cardName: "Markets",
      cardTable: <MarketsTable />,
      cardFallback: <MarketsTable.Fallback />,
      CardAction: (
        <AddButtonModal opensWindowName="add-Markets" buttonLabel="Add Market">
          <AddMarketForm />
        </AddButtonModal>
      ),
    },
  ];

  return (
    <div className="flex h-full flex-col gap-5 overflow-scroll p-2">
      <div className="m-3 flex items-center">
        <h1 className="text-2xl font-semibold font-stretch-semi-expanded">
          Company Setup
        </h1>
      </div>
      <div className="flex flex-col gap-4">
        {cards.map((card) => (
          <Collapsible key={card.name} asChild>
            <Card key={card.cardName}>
              <Card.CardHeader>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between">
                    <Button variant="ghost" size="icon" className="size-8">
                      <ChevronsUpDownIcon />
                      <span className="sr-only">Toggle</span>
                    </Button>
                    <Card.CardTitle>{card.cardName}</Card.CardTitle>
                  </div>
                </CollapsibleTrigger>
                <Card.CardAction>{card.CardAction} </Card.CardAction>
              </Card.CardHeader>
              <CollapsibleContent>
                <Card.CardContent>
                  <Suspense fallback={card.cardFallback}>
                    {card.cardTable}
                  </Suspense>
                </Card.CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
        {/* <Card>
        <Card.CardHeader>
        <Card.CardTitle>Form</Card.CardTitle>
        </Card.CardHeader>
        <Card.CardContent>
        <AddLocationForm />
        </Card.CardContent>
        </Card> */}
      </div>
    </div>
  );
}
