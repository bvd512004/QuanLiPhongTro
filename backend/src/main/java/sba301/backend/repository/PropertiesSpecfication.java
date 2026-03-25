package sba301.backend.repository;

import com.jayway.jsonpath.Criteria;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import sba301.backend.entity.User;

import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

public final class PropertiesSpecfication {

    @PersistenceContext
    private static EntityManager em;
    private PropertiesSpecfication() {

    }
    public static List<User> specfication() {

        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<User> cq = cb.createQuery(User.class);
        Root<User> user = cq.from(User.class);
        cq.select(user).where(cb.equal(user.get("name"), "sba301"));

    return em.createQuery(cq).getResultList();
    }
}
