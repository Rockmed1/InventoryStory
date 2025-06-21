import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function Table({ data, lables }) {
  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-neutral-200">
        <table className="w-full table-auto text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-100">
              <th scope="col" className="p-2 font-medium"></th>

              {lables.map(lable => (
                <th scope="col" key={lable} className="p-2 font-medium">
                  {lable}
                </th>
              ))}

              <th scope="col" className="p-2 text-center font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {data &&
              data.map(row => (
                <tr
                  key={row.id}
                  className="hover:bg-primary-50 border-b border-neutral-200 transition-all duration-300"
                >
                  <td className="">
                    <button
                      type="button"
                      role="checkbox"
                      className="ml-2 size-4 rounded-[3px] border border-neutral-200 shadow-sm"
                    />
                  </td>
                  {Object.keys(row).map(key => (
                    <td key={key} className="p-2">
                      {key === 'id' || key === 'name' ? (
                        <Link
                          href={`/items/${row['id']}`}
                          className="transition-all duration-200 hover:underline"
                        >
                          {row[key]}
                        </Link>
                      ) : (
                        row[key]
                      )}
                    </td>
                  ))}

                  <td className="w-3 p-2 text-neutral-700 transition-all duration-200">
                    <EllipsisVerticalIcon className="size-6 stroke-1 hover:stroke-2" />
                  </td>
                </tr>
              ))}

            {/* //Display place holder table for suspence fallback until the data is available */}
            {!data &&
              Array.from({ length: 3 }, (_, i) => (
                <tr key={i} className="border-b border-neutral-200">
                  <td>
                    <button
                      type="button"
                      role="checkbox"
                      className="ml-2 size-4 rounded-[3px] border border-neutral-200 shadow-sm"
                    />
                  </td>
                  {lables.map(label => (
                    <td key={label} className="p-2">
                      <div className="loader3"></div>
                    </td>
                  ))}

                  <td className="w-3 p-2 text-neutral-700">
                    <EllipsisVerticalIcon className="size-6 stroke-1" />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
