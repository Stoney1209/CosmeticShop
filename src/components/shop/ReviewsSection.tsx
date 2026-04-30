"use client";

import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createReview } from "@/app/actions/reviews";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ReviewItem = {
  id: number;
  rating: number;
  title: string | null;
  comment: string | null;
  createdAt: string;
  customer: { fullName: string };
};

const REVIEWS_PER_PAGE = 5;

export function ReviewsSection({
  productId,
  reviews,
  isLoggedIn,
  canReview,
}: {
  productId: number;
  reviews: ReviewItem[];
  isLoggedIn: boolean;
  canReview: boolean;
}) {
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
  const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE;
  const paginatedReviews = reviews.slice(startIndex, startIndex + REVIEWS_PER_PAGE);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <section className="mt-20">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              Reseñas 
              <span className="text-lg font-normal text-slate-500">({reviews.length})</span>
            </h2>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-slate-600">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="space-y-4">
            {paginatedReviews.length > 0 ? (
              paginatedReviews.map((review) => (
                <article key={review.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{review.customer.fullName}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(review.createdAt).toLocaleDateString("es-MX")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className={`h-4 w-4 ${
                            index < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.title && <h3 className="mt-3 font-semibold text-slate-800">{review.title}</h3>}
                  {review.comment && <p className="mt-2 text-sm leading-6 text-slate-600">{review.comment}</p>}
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-sm text-slate-500">
                Todavía no hay reseñas para este producto.
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="rounded-full"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <Button
                    key={index}
                    variant={currentPage === index + 1 ? "default" : "outline"}
                    size="icon"
                    className={`h-8 w-8 rounded-full ${
                      currentPage === index + 1 ? "bg-pink-600 hover:bg-pink-700" : ""
                    }`}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="rounded-full"
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-bold text-slate-900">Comparte tu experiencia</h3>
          {!isLoggedIn ? (
            <p className="mt-3 text-sm text-slate-500">Inicia sesión para dejar una reseña.</p>
          ) : !canReview ? (
            <p className="mt-3 text-sm text-slate-500">Ya dejaste una reseña para este producto.</p>
          ) : (
            <form
              className="mt-5 space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();
                setIsSubmitting(true);
                const result = await createReview({ productId, rating, title, comment });
                setIsSubmitting(false);

                if (!result.success) {
                  toast.error(result.error);
                  return;
                }

                setTitle("");
                setComment("");
                setRating(5);
                toast.success("Gracias por tu reseña.");
                window.location.reload();
              }}
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Calificación</label>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const value = index + 1;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRating(value)}
                        className="rounded-full p-1"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            value <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Título</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="¿Qué te gustó?" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Comentario</label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Cuéntanos cómo te fue con el producto."
                  rows={5}
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 text-white hover:bg-slate-800">
                {isSubmitting ? "Enviando..." : "Enviar reseña"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

