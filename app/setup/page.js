import { Suspense } from "react";
import LocationsTable from "../_components/locationsTable";
import Card from "../_ui/Card";
import BinsTable from "../_components/BinsTable";

export default function Page() {
  return (
    <div className="grid grid-cols-2 gap-4 px-4">
      <Card>
        <Card.CardHeader>Locations</Card.CardHeader>
        <Card.CardContent>
          <Suspense fallback={<LocationsTable.Fallback />}>
            <LocationsTable />
          </Suspense>
        </Card.CardContent>
      </Card>
      <Card>
        <Card.CardHeader>Bins</Card.CardHeader>
        <Card.CardContent>
          <Suspense fallback={<BinsTable.Fallback />}>
            <BinsTable />
          </Suspense>
        </Card.CardContent>
      </Card>
      <Card>
        <Card.CardHeader>Item classes</Card.CardHeader>
        <Card.CardContent>Table</Card.CardContent>
      </Card>
      <Card>
        <Card.CardHeader>Market Type</Card.CardHeader>
        <Card.CardContent>Table</Card.CardContent>
      </Card>
      <Card>
        <Card.CardHeader>Market</Card.CardHeader>
        <Card.CardContent>Table</Card.CardContent>
      </Card>
      <Card>
        <Card.CardHeader>Market</Card.CardHeader>
        <Card.CardContent>Table</Card.CardContent>
      </Card>
      <Card>
        <Card.CardHeader>Items Transaction Types</Card.CardHeader>
        <Card.CardContent>Table</Card.CardContent>
      </Card>
    </div>
  );
}
