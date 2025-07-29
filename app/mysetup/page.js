import { Suspense } from "react";
import Card from "../_components/_ui/server/Card";
import AddButtonModal from "../_components/_ui/client/AddButtonModal";
import AddBinForm from "../_components/client/AddBinForm";
import AddItemClassForm from "../_components/client/AddItemClassForm";
import AddLocationForm from "../_components/client/AddLocationForm";
import AddMarketForm from "../_components/client/AddMarketForm";
import AddMarketTypeForm from "../_components/client/AddMarketTypeForm";
import AddTrxTypeForm from "../_components/client/AddTrxTypeForm";
import BinsTable from "../_components/server/BinsTable";
import ItemClassesTable from "../_components/server/ItemClassesTable";
import LocationsTable from "../_components/server/locationsTable";
import MarketsTable from "../_components/server/MarketsTable";
import MarketTypesTable from "../_components/server/MarketTypesTable";
import TrxTypesTable from "../_components/server/TrxTypesTable";
import UseAuth from "../_hooks/useAuth";

export const revalidate = 0; // this will make the page dynamic and revalidate cache every request

export default function Page() {
  //1- authenticate the user
  const { _org_uuid, _usr_uuid } = UseAuth();

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
      cardTable: <TrxTypesTable org_uuid={_org_uuid} />,
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
    <div className="grid grid-cols-2 gap-4 px-3">
      {cards.map((card) => (
        <Card key={card.cardName}>
          <Card.CardHeader>
            <Card.CardTitle>{card.cardName}</Card.CardTitle>
            <Card.CardAction>{card.CardAction} </Card.CardAction>
          </Card.CardHeader>
          <Card.CardContent>
            <Suspense fallback={card.cardFallback}>{card.cardTable}</Suspense>
          </Card.CardContent>
        </Card>
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
  );
}
