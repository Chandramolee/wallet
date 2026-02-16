/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Loader,
    MoreHorizontal,
    Pencil,
    Copy,
    Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
    useDeleteTransactionMutation,
    useDuplicateTransactionMutation,
} from "@/features/transaction/transactionAPI";
import useEditTransactionDrawer from "@/hooks/use-edit-transaction-drawer";

export const ActionsCell = ({ row }: { row: any }) => {
    const transactionId = row.original.id;
    const { onOpenDrawer } = useEditTransactionDrawer();

    const [duplicateTransaction, { isLoading: isDuplicating }] =
        useDuplicateTransactionMutation();

    const [deleteTransaction, { isLoading: isDeleting }] =
        useDeleteTransactionMutation();

    const handleDuplicate = (e: Event) => {
        e.preventDefault();
        if (isDuplicating) return;
        duplicateTransaction(transactionId)
            .unwrap()
            .then(() => {
                toast.success("Transaction duplicated successfully");
            })
            .catch((error) => {
                toast.error(error.data?.message || "Failed to duplicate transaction");
            });
    };

    const handleDelete = (e: Event) => {
        e.preventDefault();
        if (isDeleting) return;
        deleteTransaction(transactionId)
            .unwrap()
            .then(() => {
                toast.success("Transaction deleted successfully");
            })
            .catch((error) => {
                toast.error(error.data?.message || "Failed to delete transaction");
            });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-44"
                align="end"
                onCloseAutoFocus={(e) => {
                    if (isDeleting || isDuplicating) {
                        e.preventDefault();
                    }
                }}
            >
                <DropdownMenuItem onClick={() => onOpenDrawer(transactionId)}>
                    <Pencil className="mr-1 h-4 w-4" />
                    Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="relative"
                    disabled={isDuplicating}
                    onSelect={handleDuplicate}
                >
                    <Copy className="mr-1 h-4 w-4" />
                    Duplicate
                    {isDuplicating && (
                        <Loader className="ml-1 h-4 w-4 absolute right-2 animate-spin" />
                    )}
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="relative !text-destructive"
                    disabled={isDeleting}
                    onSelect={handleDelete}
                >
                    <Trash2 className="mr-1 h-4 w-4 !text-destructive" />
                    Delete
                    {isDeleting && (
                        <Loader className="ml-1 h-4 w-4 absolute right-2 animate-spin" />
                    )}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
