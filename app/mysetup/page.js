import { Suspense } from "react";
import Card from "../_components/_ui/Card";
import AddButtonModal from "../_components/_ui/client/AddButtonModal";
import BinsTable from "../_components/BinsTable";
import AddBinForm from "../_components/client/AddBinForm";
import AddLocationForm from "../_components/client/AddLocationForm";
import ItemClassesTable from "../_components/ItemClassesTable";
import LocationsTable from "../_components/locationsTable";
import MarketsTable from "../_components/MarketsTable";
import MarketTypesTable from "../_components/MarketTypesTable";
import TrxTypesTable from "../_components/TrxTypesTable";
import UseAuth from "../_hooks/useAuth";

export default function Page() {
  //1- authenticate the user
  const { _org_uuid, _usr_uuid } = UseAuth();

  const cards = [
    {
      cardName: "Locations",
      cardTable: <LocationsTable org_uuid={_org_uuid} />,
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
      cardTable: <BinsTable org_uuid={_org_uuid} />,
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
      cardTable: <ItemClassesTable org_uuid={_org_uuid} />,
      cardFallback: <ItemClassesTable.Fallback />,
      CardAction: (
        <AddButtonModal
          opensWindowName="add-Item-Classes"
          buttonLabel="Add Item Class">
          Add Location placeholder
        </AddButtonModal>
      ),
    },

    {
      cardName: "Market Types",
      cardTable: <MarketTypesTable org_uuid={_org_uuid} />,
      cardFallback: <MarketTypesTable.Fallback />,
      CardAction: (
        <AddButtonModal
          opensWindowName="add-Market-Types"
          buttonLabel="Add Market Type">
          Add Location placeholder
        </AddButtonModal>
      ),
    },

    {
      cardName: "Markets",
      cardTable: <MarketsTable org_uuid={_org_uuid} />,
      cardFallback: <MarketsTable.Fallback />,
      CardAction: (
        <AddButtonModal opensWindowName="add-Markets" buttonLabel="Add Market">
          Add Location placeholder
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
          Add Location placeholder
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
      <Card>
        <Card.CardHeader>
          <Card.CardTitle>Form</Card.CardTitle>
        </Card.CardHeader>
        <Card.CardContent>
          <AddLocationForm />
        </Card.CardContent>
      </Card>
    </div>
  );
}
