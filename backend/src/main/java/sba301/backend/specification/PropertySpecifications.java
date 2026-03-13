package sba301.backend.specification;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import sba301.backend.entity.Property;
import sba301.backend.entity.User;
import sba301.backend.enums.PropertyStatus;

import java.util.ArrayList;
import java.util.List;

public final class PropertySpecifications {

    private PropertySpecifications() {
    }

    public static Specification<Property> buildModerationSpec(PropertyStatus status, String keyword) {
        return (root, query, cb) -> {
            query.distinct(true);

            List<Predicate> predicates = new ArrayList<>();

            // always filter by status (non-null is guaranteed by caller)
            predicates.add(cb.equal(root.get("status"), status));

            // optional: filter out soft-deleted records if needed
            predicates.add(cb.isFalse(root.get("isDeleted")));

            if (keyword != null && !keyword.trim().isEmpty()) {
                String kw = "%" + keyword.toLowerCase().trim() + "%";

                Join<Property, User> hostJoin = root.join("host", JoinType.LEFT);

                Predicate titleLike = cb.like(cb.lower(root.get("title")), kw);
                Predicate hostEmailLike = cb.like(cb.lower(hostJoin.get("email")), kw);

                predicates.add(cb.or(titleLike, hostEmailLike));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

