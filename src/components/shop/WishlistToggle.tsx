"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { toggleWishlist } from "@/app/actions/wishlist";
import { Button } from "@/components/ui/button";

export function WishlistToggle({
  productId,
  initialInWishlist,
  isLoggedIn,
}: {
  productId: number;
  initialInWishlist: boolean;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [inWishlist, setInWishlist] = useState(initialInWishlist);
  const [isPending, setIsPending] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isPending}
      className="rounded-full"
      onClick={async () => {
        if (!isLoggedIn) {
          router.push("/cuenta/ingresar");
          return;
        }

        setIsPending(true);
        const result = await toggleWishlist(productId);
        setIsPending(false);

        if (!result.success) {
          toast.error(result.error);
          return;
        }

        setInWishlist(Boolean(result.inWishlist));
        toast.success(result.inWishlist ? "Agregado a favoritos." : "Quitado de favoritos.");
      }}
    >
      <Heart className={`mr-2 h-4 w-4 ${inWishlist ? "fill-pink-600 text-pink-600" : ""}`} />
      {inWishlist ? "En favoritos" : "Guardar"}
    </Button>
  );
}
