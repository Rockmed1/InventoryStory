"use client";

// import { useFieldArray, useForm } from "react-hook-form";

import { Controller, useFieldArray, useForm } from "react-hook-form";

export default function TestForm() {
  const { register, control, handleSubmit, reset, trigger, setError } = useForm(
    {
      // defaultValues: {}; you can populate the fields by this attribute
    },
  );
  const { fields, append, remove } = useFieldArray({
    control,
    name: "test",
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <ul>
        {fields.map((item, index) => (
          <li key={item.id}>
            <input {...register(`test.${index}.firstName`)} />
            <Controller
              name={`test.${index}.lastName`}
              control={control}
              render={({ field }) => <input {...field} />}
            />
            <button type="button" onClick={() => remove(index)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => append({ firstName: "bill", lastName: "luo" })}>
        append
      </button>
      <input type="submit" />
    </form>
  );
}
