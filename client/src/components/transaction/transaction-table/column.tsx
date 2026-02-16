import {
  ArrowUpDown,
  CircleDot,
  LucideIcon,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/format-currency";
import { TransactionType } from "@/features/transaction/transationType";
import { _TRANSACTION_FREQUENCY, _TRANSACTION_TYPE } from "@/constant";

import { ActionsCell } from "./actions-cell";

type FrequencyInfo = {
  label: string;
  icon: LucideIcon;
};
type FrequencyMapType = {
  [key: string]: FrequencyInfo;
  DEFAULT: FrequencyInfo;
};

export const transactionColumns: ColumnDef<TransactionType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        className="!border-black data-[state=checked]:!bg-gray-800 !text-white"
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        className="!border-black data-[state=checked]:!bg-gray-800 !text-white"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date Created
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => format(row.getValue("createdAt"), "MMM dd, yyyy"),
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="!pl-0"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Category
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const category = row.original.category;
      return <div className="capitalize">{category}</div>;
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Type
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="capitalize">
        <span
          className={`px-2 py-1 rounded-full text-xs ${row.getValue("type") === _TRANSACTION_TYPE.INCOME
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
            }`}
        >
          {row.getValue("type")}
        </span>
      </div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const type = row.getValue("type");

      return (
        <div
          className={`text-right font-medium ${type === _TRANSACTION_TYPE.INCOME
            ? "text-green-600"
            : "text-destructive"
            }`}
        >
          {type === _TRANSACTION_TYPE.EXPENSE ? "-" : "+"}
          {formatCurrency(amount)}
        </div>
      );
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Transaction Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => format(row.original.date, "MMM dd, yyyy"),
  },
  {
    accessorKey: "paymentMethod",
    header: "Payment Method",
    cell: ({ row }) => {
      const paymentMethod = row.original.paymentMethod;
      if (!paymentMethod) return "N/A";
      //remove _
      const paymentMethodWithoutUnderscore = paymentMethod
        ?.replace("_", " ")
        ?.toLowerCase();
      return <div className="capitalize">{paymentMethodWithoutUnderscore}</div>;
    },
  },
  {
    accessorKey: "recurringInterval",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Frequently
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const frequency = row.getValue("recurringInterval");
      const nextDate = row.original?.nextRecurringDate;
      const isRecurring = row.original?.isRecurring;

      const frequencyMap: FrequencyMapType = isRecurring
        ? {
          [_TRANSACTION_FREQUENCY.DAILY]: { label: "Daily", icon: RefreshCw },
          [_TRANSACTION_FREQUENCY.WEEKLY]: {
            label: "Weekly",
            icon: RefreshCw,
          },
          [_TRANSACTION_FREQUENCY.MONTHLY]: {
            label: "Monthly",
            icon: RefreshCw,
          },
          [_TRANSACTION_FREQUENCY.YEARLY]: {
            label: "Yearly",
            icon: RefreshCw,
          },
          DEFAULT: { label: "One-time", icon: CircleDot }, // Fallback
        }
        : { DEFAULT: { label: "One-time", icon: CircleDot } };

      const frequencyKey = isRecurring ? (frequency as string) : "DEFAULT";
      const frequencyInfo =
        frequencyMap?.[frequencyKey] || frequencyMap.DEFAULT;
      const { label, icon: Icon } = frequencyInfo;

      return (
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span>{label}</span>
            {nextDate && isRecurring && (
              <span className="text-xs text-muted-foreground">
                Next: {format(nextDate, "MMM dd yyyy")}
              </span>
            )}
          </div>
        </div>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <ActionsCell row={row} />,
  },
];
