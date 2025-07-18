"use client";

import Button from "@/app/_components/_ui/Button";
import Form from "@/app/_components/_ui/client/Form";
import SpinnerMini from "@/app/_components/_ui/SpinnerMini";
import { useActionState, useState } from "react";
import DatePicker from "./DatePicker";
import { DropDown } from "./DropDown";

// This would be your server action - place this in a separate file
async function createItem(prevState, formData) {
  // Extract form data and process it
  const rawData = Object.fromEntries(formData.entries());

  // Process the data to match your schema
  const processedData = {
    _org_uuid: rawData._org_uuid,
    _usr_uuid: rawData._usr_uuid,
    _trx_header: {
      _trx_date: rawData._trx_date,
      _trx_desc: rawData._trx_desc,
      _market_id: rawData._market_id,
      _trx_type_id: rawData._trx_type_id,
      _num_of_lines: rawData._num_of_lines,
    },
    _trx_details: JSON.parse(rawData._trx_details || "[]"),
  };

  try {
    // Your API call or database operation here
    console.log("Processed data:", processedData);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      success: true,
      message: "Transaction created successfully!",
      data: processedData,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to create transaction",
      error: error.message,
    };
  }
}

const initialState = {
  success: false,
  message: "",
  data: null,
};

export default function TransactionForm() {
  const [formState, formAction, pending] = useActionState(
    createItem,
    initialState,
  );

  const [formData, setFormData] = useState({
    // const [clientFormState, setClientFormState] = useState({
    _trx_header: {
      _trx_date: "",
      _trx_desc: "",
      _market_id: "",
      _trx_type_id: "",
      _num_of_lines: "0",
    },
    _trx_details: [],
  });

  const [output, setOutput] = useState(null);

  // Update output when formState changes
  useState(() => {
    if (formState.success && formState.data) {
      setOutput(formState.data);
    }
  }, [formState]);

  const handleHeaderChange = (field, value) => {
    console.log(field, value);

    setFormData((prev) => ({
      ...prev,
      _trx_header: {
        ...prev._trx_header,
        [field]: value,
      },
    }));
  };

  const handleDetailChange = (index, field, value) => {
    console.log(index, field, value);

    setFormData((prev) => ({
      ...prev,
      _trx_details: prev._trx_details.map((detail, i) =>
        i === index ? { ...detail, [field]: value } : detail,
      ),
    }));
  };

  const addDetailLine = (e) => {
    const newLine = {
      _qty_in: null,
      _to_bin: "",
      _item_id: "",
      _qty_out: null,
      _from_bin: null,
      _trx_line_num: (formData._trx_details.length + 1).toString(),
      _item_trx_desc: "",
    };

    setFormData((prev) => ({
      ...prev,
      _trx_details: [...prev._trx_details, newLine],
      _trx_header: {
        ...prev._trx_header,
        _num_of_lines: (prev._trx_details.length + 1).toString(),
      },
    }));
  };

  const removeDetailLine = (index) => {
    setFormData((prev) => ({
      ...prev,
      _trx_details: prev._trx_details
        .filter((_, i) => i !== index)
        .map((detail, i) => ({ ...detail, _trx_line_num: (i + 1).toString() })),
      _trx_header: {
        ...prev._trx_header,
        _num_of_lines: (prev._trx_details.length - 1).toString(),
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formDataObj = new FormData(e.target);

    // Process the data to match your schema exactly
    const processedDetails = formData._trx_details.map((detail) => ({
      ...detail,
      _qty_in: detail._qty_in ? parseInt(detail._qty_in) : null,
      _qty_out: detail._qty_out ? parseInt(detail._qty_out) : null,
      _from_bin: detail._from_bin || null,
      _to_bin: detail._to_bin || null,
    }));

    // console.log(formData);

    // Add processed data to FormData
    formDataObj.append("_trx_details", JSON.stringify(processedDetails));

    // const rawData = Object.fromEntries(formDataObj.entries());
    // console.log(rawData);

    // Call the server action
    formAction(formDataObj);
  };

  return (
    <div className="mx-auto min-h-screen max-w-4xl p-6">
      <div className="rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-8 text-center text-3xl font-bold text-neutral-800">
          Transaction Form
        </h1>

        <Form onSubmit={handleSubmit} className="space-y-8">
          {/* Organization & User Info */}
          {/* <div className="rounded-lg bg-neutral-50 p-6">
            <h3 className="mb-4 border-b-2 border-blue-500 pb-2 text-lg font-semibold text-neutral-700">
              Organization & User Info
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Form.InputWithLabel
                name="_org_uuid"
                inputValue={formData._org_uuid}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    _org_uuid: e.target.value,
                  }))
                }
                required>
                Organization UUID
              </Form.InputWithLabel>
              <Form.InputWithLabel
                name="_usr_uuid"
                inputValue={formData._usr_uuid}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    _usr_uuid: e.target.value,
                  }))
                }
                required>
                User UUID
              </Form.InputWithLabel>
            </div>
          </div> */}

          {/* Transaction Header */}
          <div className="rounded-lg bg-neutral-50 p-6">
            <h3 className="mb-4 border-b-2 border-neutral-500 pb-2 text-lg font-semibold text-neutral-700">
              Transaction Header
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Form.InputSelect>
                <Form.Label>Transaction Type</Form.Label>
                <DropDown
                  parent="trxType"
                  name="_trx_type_id"
                  label="trx type"
                  required={true}
                  value={formData._trx_header._trx_type_id}
                  onChange={(value) =>
                    handleHeaderChange("_trx_type_id", value)
                  }
                />
              </Form.InputSelect>

              <DatePicker
                name="_trx_date"
                onChange={(value) => handleHeaderChange("_trx_date", value)}
              />

              <Form.InputSelect>
                <Form.Label>Market</Form.Label>
                <DropDown
                  parent="market"
                  name="_market_id"
                  label="market"
                  required={true}
                  value={formData._trx_header._market_id}
                  onChange={(value) => handleHeaderChange("_market_id", value)}
                />
              </Form.InputSelect>
            </div>
            <div className="mt-4">
              <Form.InputWithLabel
                name="_trx_desc"
                inputValue={formData._trx_header._trx_desc}
                onChange={(e) =>
                  handleHeaderChange("_trx_desc", e.target.value)
                }
                required>
                Transaction Description
              </Form.InputWithLabel>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="rounded-lg bg-neutral-50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="border-b-2 border-neutral-500 pb-2 text-lg font-semibold text-neutral-700">
                Transaction Details ({formData._trx_details.length} lines)
              </h3>
              <Button variant="primary" onClick={addDetailLine}>
                Add Line
              </Button>
            </div>

            {formData._trx_details.map((row, index) => (
              <div
                key={index}
                className="mb-4 rounded-lg border border-neutral-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-md font-medium text-neutral-600">
                    Line {row._trx_line_num}
                  </h4>
                  <Button
                    variant="danger"
                    onClick={() => removeDetailLine(index)}>
                    -
                  </Button>
                </div>

                <div className="mb-3 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Form.InputSelect>
                    <Form.Label>Item</Form.Label>
                    <DropDown
                      parent="item"
                      name="_item_id"
                      label="item"
                      required={true}
                      value={row._item_id}
                      onChange={(value) =>
                        handleDetailChange(index, "_item_id", value)
                      }
                    />
                  </Form.InputSelect>
                  <Form.InputWithLabel
                    name={`_qty_in_${index}`}
                    type="number"
                    inputValue={row._qty_in || ""}
                    onChange={(e) =>
                      handleDetailChange(index, "_qty_in", e.target.value)
                    }>
                    Quantity In
                  </Form.InputWithLabel>
                  <Form.InputWithLabel
                    name={`_qty_out_${index}`}
                    type="number"
                    inputValue={row._qty_out || ""}
                    onChange={(e) =>
                      handleDetailChange(index, "_qty_out", e.target.value)
                    }>
                    Quantity Out
                  </Form.InputWithLabel>
                  <Form.InputSelect>
                    <Form.Label>From Bin</Form.Label>
                    <DropDown
                      parent="bin"
                      name="_from_bin"
                      label="bin"
                      value={row._from_bin || ""}
                      onChange={(value) =>
                        handleDetailChange(index, "_from_bin", value)
                      }
                    />
                  </Form.InputSelect>
                  <Form.InputSelect>
                    <Form.Label>To Bin</Form.Label>
                    <DropDown
                      parent="bin"
                      name="_to_bin"
                      label="bin"
                      value={row._to_bin || ""}
                      onChange={(value) =>
                        handleDetailChange(index, "_to_bin", value)
                      }
                    />
                  </Form.InputSelect>
                </div>

                <Form.InputWithLabel
                  name={`_item_trx_desc_${index}`}
                  inputValue={row._item_trx_desc}
                  onChange={(e) =>
                    handleDetailChange(index, "_item_trx_desc", e.target.value)
                  }
                  required>
                  Item Transaction Description
                </Form.InputWithLabel>
              </div>
            ))}
          </div>

          {/* Hidden field for num_of_lines */}
          <input
            type="hidden"
            name="_num_of_lines"
            value={formData._trx_header._num_of_lines}
          />

          <Form.Footer>
            <Button type="submit" disabled={pending}>
              {pending ? <SpinnerMini /> : "Create Transaction"}
            </Button>
          </Form.Footer>
        </Form>

        {/* Status Messages */}
        {formState.message && (
          <div
            className={`mt-4 rounded-md p-4 ${
              formState.success
                ? "border border-green-200 bg-green-50 text-green-800"
                : "border border-red-200 bg-red-50 text-red-800"
            }`}>
            {formState.message}
          </div>
        )}

        {/* Output */}
        {output && (
          <div className="mt-8 rounded-lg bg-neutral-100 p-6">
            <h3 className="mb-4 text-lg font-semibold text-neutral-700">
              Generated Schema Output:
            </h3>
            <pre className="overflow-x-auto rounded-md bg-neutral-800 p-4 text-sm text-green-400">
              {JSON.stringify(output, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

const dummyformData = {
  _trx_date: "July 15, 2025",
  _trx_type_id: "1000",
  _market_id: "1001",
  _trx_desc: "fert",
  _item_id: "1001",
  _qty_in_0: "9",
  _qty_out_0: "5",
  _from_bin: "1001",
  _to_bin: "1005",
  _item_trx_desc_0: "dfsdfas",
  _qty_in_1: "1",
  _qty_out_1: "6",
  _item_trx_desc_1: "rtsdfgsdf",
  _num_of_lines: "2",
  _trx_details: [
    {
      _qty_in: 6,
      _to_bin: "1002",
      _item_id: "1001",
      _qty_out: 5,
      _from_bin: "1001",
      _trx_line_num: "1",
      _item_trx_desc: "ytery",
    },
    {
      _qty_in: 4,
      _to_bin: "1002",
      _item_id: "1038",
      _qty_out: 3,
      _from_bin: "1002",
      _trx_line_num: "2",
      _item_trx_desc: "asdf",
    },
  ],
};

const dummyformDataObj = {
  _trx_header: {
    _trx_date: "",
    _trx_desc: "fert",
    _market_id: "",
    _trx_type_id: "",
    _num_of_lines: "2",
  },
  _trx_details: [
    {
      _qty_in: "9",
      _to_bin: "",
      _item_id: "",
      _qty_out: "5",
      _from_bin: null,
      _trx_line_num: "1",
      _item_trx_desc: "dfsdfas",
    },
    {
      _qty_in: "1",
      _to_bin: "",
      _item_id: "",
      _qty_out: "6",
      _from_bin: null,
      _trx_line_num: "2",
      _item_trx_desc: "rtsdfgsdf",
    },
  ],
};
