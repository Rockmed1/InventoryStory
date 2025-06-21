import { PlusIcon } from '@heroicons/react/24/outline';
import { Suspense } from 'react';
import Button from '../_components/Button';
import ItemsTable from '../_components/ItemsTable';
import Table from '../_components/Table';

export const metadata = {
  title: 'items',
};

// export const revalidate = 0; // this will make the page dynamic and revalidate cache every request

export default async function Items() {
  const lables = ['Item ID', 'Name', 'Description', 'Class', 'QOH'];
  // cookies(); //headers() //
  return (
    <>
      <div className="container grid items-center gap-6">
        <div className="grid items-center justify-between">
          <Button>
            <div className="flex items-center justify-between gap-1">
              <PlusIcon className="size-4" /> {'  '}
              <span>Add item</span>
            </div>
          </Button>
        </div>
        <Suspense fallback={<Table lables={lables} />}>
          <ItemsTable lables={lables} />
        </Suspense>
      </div>
    </>
  );
}
