//metadata
export async function generateMetadata({ params }) {
  const { itemId } = await params;
  return { title: `Item: ${itemId}` };
}

//page
export default async function Page({ params }) {
  const { itemId } = await params;
  if (itemId === 'error') {
    throw new Error('item Id error');
  }

  console.log(itemId);
  return <div>Item ID {itemId} details...</div>;
}
