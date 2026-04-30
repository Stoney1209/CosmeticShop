"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { toggleWishlist } from "@/app/actions/wishlist";

interface WishlistRemoveButtonProps {
  wishlistId: number;
  productName: string;
}

export function WishlistRemoveButton({ wishlistId, productName }: WishlistRemoveButtonProps) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    
    const result = await toggleWishlist(wishlistId);
    
    if (result.success) {
      toast.success(`${productName} eliminado de favoritos`);
      // Refresh the page to update the list
      window.location.reload();
    } else {
      toast.error(result.error || "Error al eliminar de favoritos");
    }
    
    setIsRemoving(false);
  };

  return (
    <Button
      variant="destructive"
      size="icon"
      className="h-8 w-8 rounded-full shadow-lg"
      onClick={handleRemove}
      disabled={isRemoving}
      title="Eliminar de favoritos"
    >
      <X className="h-4 w-4" />
    </Button>
  );
}
