/**
 * A full-page overlay loader with a blurred background.
 * Used to indicate a loading state for an entire page or view.
 */
export default function Loader() {
  return (
    //inset-0 is top=0 bottom=0 left=0 right=0 to put the element in the middle of the page
    //give it a background with opacity
    //backdrop-blur is to make blury background
    <div className="absolute inset-0 flex items-center justify-center bg-slate-200/30 backdrop-blur-sm">
      <div className="loader1"></div>
    </div>
  );
}
