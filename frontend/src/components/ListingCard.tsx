import { Link } from "react-router-dom";
import type { ListingListItem } from "../api/types";
import { imageUrl } from "../utils/imageUrl";

type Props = {
  item: ListingListItem;
};

export default function ListingCard({ item }: Props) {
  const cover = imageUrl(item.coverImageUrl);

  return (
    <div className="listingCard">
      <Link to={`/listings/${item.id}`} className="listingCard__link">

        <div className="listingCard__imageWrapper">
          {cover && (
            <img
              src={cover}
              alt={item.title}
              className="listingCard__img"
              loading="lazy"
            />
          )}
        </div>

        <div className="listingCard__body">
          <div className="listingCard__meta">
            {item.city}
            {item.district ? `, ${item.district}` : ""}
            {" • "}
            {item.areaM2} m²
            {" • "}
            {item.rooms} szoba
          </div>

          <div className="listingCard__price">
            {Number(item.price).toLocaleString("hu-HU")} {item.currency}
          </div>
        </div>
      </Link>
    </div>
  );
}